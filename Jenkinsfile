@Library('web-service-helper-lib') _

pipeline {
    agent { label 'docker' }
    parameters {
        booleanParam(
            name: 'FULL_BUILD',
            defaultValue: false,
            description: 'Perform a full build without using any caches. This may take longer but ensures a clean build.'
        )
        booleanParam(
            name: 'RELEASE',
            defaultValue: false,
            description: 'Indicate if this build should be treated as a release. If true, the container image will be uploaded.'
        )
        choice(
            name: 'RELEASE_IMAGE_TAG',
            choices: ['NONE', 'UNSTABLE', 'LATEST', 'TESTING'],
            description: 'Select the Docker tag to be used for the release image. Choose NONE if not releasing.'
        )
        string(
            name: 'RELEASE_API_VERSION',
            defaultValue: '',
            description: 'Manually specify a tag for the Docker image. This tag will be preferred over the package version if set. Only used in case RELEASE is true'
        )
    }
    environment {
        API_VERSION = packageJson.getVersion() // package.json must be in the root level in order for this to work
        TZ = 'Europe/Berlin'
        
        NX_BASE = 'master'
        NX_HEAD = 'HEAD'
        NX_BRANCH = env.BRANCH_NAME.replace('PR-', '')
        NX_REJECT_UNKNOWN_LOCAL_CACHE = 0
        
        NODE_DOCKER_IMAGE = 'node:21-bullseye'
        TARGET_PREFIX = 'e-learning-by-sse/nm-self-learning'
        // we need the .npm and .cache folders in a separate volume to avoid permission issues during npm install
        DOCKER_ARGS = "--tmpfs /.npm -v ${env.WORKSPACE}/build-caches/npm:${env.WORKSPACE}/.npm -v $HOME/build-caches/cache:/.cache -v $HOME/build-caches/nx:${env.WORKSPACE}/.nx"
    }

    options {
        ansiColor('xterm')
    }
    stages {
        stage('NPM Install') {
            agent {
                docker {
                    image "${NODE_DOCKER_IMAGE}"
                    args "${DOCKER_ARGS}"
                    reuseNode true // This is important to enable the use of the docker socket for sidecar pattern later
                }
            }
            environment {
                NPM_TOKEN = credentials('GitHub-NPM')
            }
            steps {
                sh 'git fetch --no-tags --force --progress origin master:master' // for nx affected
                sh 'cp -f .npmrc.example .npmrc'
                sh 'cp -f .env.example .env'
                sh 'npm install --force' // force for permission errors
            }
        }

        stage('Pipeline') {
            environment {
                POSTGRES_DB = 'SelfLearningDb'
                POSTGRES_USER = 'username'
                POSTGRES_PASSWORD = 'password'
                DATABASE_URL = "postgresql://${env.POSTGRES_USER}:${env.POSTGRES_PASSWORD}@db:5432/${env.POSTGRES_DB}"
            }
            parallel {
                stage('Master') {
                    when {
                        allOf {
                            branch 'master'
                            expression {
                                return !params.FULL_BUILD
                            }
                        }
                    }
                    steps {
                        script {
                            def projectName = env.JOB_NAME.split('/')[0]
                            def branchJobName = env.JOB_NAME.split('/')[1]
                            def jobUrl = "${env.JENKINS_URL}job/${projectName}/job/${branchJobName}/lastSuccessfulBuild/git-2/api/json" // be aware /git/ is the git data of the jenkins library
                            lastSuccessSHA = sh(
                                script: "curl ${jobUrl} | jq '.lastBuiltRevision.SHA1'",
                                returnStdout: true
                            ).trim()
                            withPostgres([dbUser: env.POSTGRES_USER, dbPassword: env.POSTGRES_PASSWORD, dbName: env.POSTGRES_DB])
                             .insideSidecar("${NODE_DOCKER_IMAGE}", "${DOCKER_ARGS}") {
                                    sh 'npm run format:check'
                                    sh 'npm run prisma:seed'
                                    sh "env TZ=${env.TZ} npx nx affected --base=${lastSuccessSHA} -t lint test build e2e-ci"
                                }
                        }
                        ssedocker {
                            create {
                                target "${env.TARGET_PREFIX}:unstable"
                            }
                            publish {}
                        }
                    }
                    post {
                        success {
                            catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                                staging02ssh "bash /opt/update-compose-project.sh selflearn-staging"
                            }
                        }
                    }
                }

                stage('PR') {
                    when {
                        allOf {
                            changeRequest()
                            expression {
                                return !params.FULL_BUILD
                            }
                        }
                    }
                    environment {
                        VERSION = "${env.API_VERSION}.${env.BRANCH_NAME.split('_')[-1]}"
                    }
                    steps {
                        script {
                            withPostgres([dbUser: env.POSTGRES_USER, dbPassword: env.POSTGRES_PASSWORD, dbName: env.POSTGRES_DB])
                             .insideSidecar("${NODE_DOCKER_IMAGE}", "${DOCKER_ARGS}") {
                                sh 'npm run format:check'
                                sh 'npm run prisma:seed'
                                sh "env TZ=${env.TZ} npx nx affected --base origin/${env.CHANGE_TARGET} -t lint test build e2e-ci"
                            }
                        }
                        ssedocker {
                            create {
                                target "${env.TARGET_PREFIX}:${env.VERSION}"
                            }
                        }
                    }
                    post {
                        success {
                            catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                                sshagent(['STM-SSH-DEMO']) {
                                    sh "docker save ${env.TARGET_PREFIX}:${env.VERSION} | ssh -o StrictHostKeyChecking=no -l jenkins 147.172.178.45 'docker load'"
                                }
                                staging02ssh "python3 /opt/selflearn-branches/demo-manager.py new-container:${env.VERSION}:${env.BRANCH_NAME} generate-html"
                            }
                        }
                    }
                }
                stage('Full build') {
                    when {
                        anyOf {
                            buildingTag()
                            expression {
                                return params.FULL_BUILD
                            }
                        }
                    }
                    steps {
                        script {
                            withPostgres([dbUser: env.POSTGRES_USER, dbPassword: env.POSTGRES_PASSWORD, dbName: env.POSTGRES_DB])
                             .insideSidecar("${NODE_DOCKER_IMAGE}", "${DOCKER_ARGS}") {
                                sh "env TZ=${env.TZ} npx nx run-many --target=build --target=test --all --skip-nx-cache"
                            }
                            if (params.RELEASE) {
                                def apiVersion = ''
                                if (params.RELEASE_API_VERSION == '') {
                                    apiVersion = "${env.API_VERSION}"
                                } else {
                                    apiVersion = "${params.RELEASE_API_VERSION}"
                                }
                                def releaseTag = ''
                                if (params.RELEASE_IMAGE_TAG == 'NONE') {
                                    releaseTag = "${apiVersion}" 
                                } else {
                                    releaseTag = "${params.RELEASE_IMAGE_TAG}"
                                }
                                ssedocker {
                                    create {
                                        target "${env.TARGET_PREFIX}:${apiVersion}"
                                    }
                                    publish {
                                        tag "${releaseTag}"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
