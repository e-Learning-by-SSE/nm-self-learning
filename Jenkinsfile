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
            name: 'PUBLISH',
            defaultValue: false,
            description: 'Indicate if this build should be published to ghcr.io. When true, the settings with PUBLISH_ prefix are used'
        )
        choice(
            name: 'PUBLISH_IMAGE_TAG',
            choices: ['NONE', 'unstable', 'latest', 'testing'],
            description: 'Select the Docker tag to be used for the image. Only used in case PUBLISH is true'
        )
        string(
            name: 'PUBLISH_API_VERSION',
            defaultValue: '',
            description: 'Manually specify an tag for the Docker image. This tag will be preferred over the package version if set. If it is not set, the version inside the package.json is used as tag. This does not override PUBLISH_IMAGE_TAG and will used as an additional tag. Only used in case PUBLISH is true.'
        )
        string(
            name: 'RELEASE_LATEST_VERSION',
            defaultValue: '',
            description: '!WARNING! - When set, the creates a new TAG and a new latest Docker Image for your. Use a natural number without a "v" prefix. Don\'t combine this with PUBLISH parameters, otherwise you get multiple images for the same tags.'
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
        TARGET_PREFIX = 'ghcr.io/e-learning-by-sse/nm-self-learning'
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
                                return (!params.FULL_BUILD || !buildingTag()) && RELEASE_LATEST_VERSION == ""
                            }
                        }
                    }
                    steps {
                        script {
                            def projectName = env.JOB_NAME.split('/')[0]
                            def branchJobName = env.JOB_NAME.split('/')[1]
                            def jobUrl = "${env.JENKINS_URL}job/${projectName}/job/${branchJobName}/lastSuccessfulBuild/git-2/api/json" // be aware /git/ is the git data of the Jenkins library
                            lastSuccessSHA = sh(
                                script: "curl ${jobUrl} | jq '.lastBuiltRevision.SHA1'",
                                returnStdout: true
                            ).trim()
                            withPostgres([dbUser: env.POSTGRES_USER, dbPassword: env.POSTGRES_PASSWORD, dbName: env.POSTGRES_DB])
                             .insideSidecar("${NODE_DOCKER_IMAGE}", "${DOCKER_ARGS}") {
                                    sh 'npm run seed' // this can be changed in the future to "npx prisma migrate reset" to test the migration files
                                    sh "env TZ=${env.TZ} npx nx affected --base=${lastSuccessSHA} -t lint build e2e-ci"
                                }

							build job: 'docs/sphinx',
								wait: true,
								propagate: true,
								parameters: [
								  string(name: 'DOCKER_VERSION', value: "unstable")
								]
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
                                staging02ssh "bash /opt/update-compose-project.sh selflearn-unstable"
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
                                sh 'npm run seed'
                                sh "env TZ=${env.TZ} npx nx affected --base origin/${env.CHANGE_TARGET} -t lint build e2e-ci"
                            }
							
							build job: 'docs/sphinx',
								wait: true,
								propagate: true,
								parameters: [
								  string(name: 'DOCKER_VERSION', value: "${env.VERSION}")
								]
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
                                sh 'npm run seed'
                                sh "env TZ=${env.TZ} npx nx run-many --target=build  --all --skip-nx-cache"
                            }
                            if (params.PUBLISH) {
                                def apiVersion = ''
                                if (params.PUBLISH_API_VERSION == '') {
                                    apiVersion = "${env.API_VERSION}"
                                } else {
                                    apiVersion = "${params.PUBLISH_API_VERSION}"
                                }
                                def releaseTag = ''
                                if (params.PUBLISH_IMAGE_TAG == 'NONE') {
                                    releaseTag = "${apiVersion}"
                                } else {
                                    releaseTag = "${params.PUBLISH_IMAGE_TAG}"
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
                stage('Create Latest Release') {
                    when {
                        expression {
                            return params.RELEASE_LATEST_VERSION != ''
                        }
                    }
                    steps {
                        script {
                            def newVersion = params.RELEASE_LATEST_VERSION
                            currentBuild.displayName = "Release ${newVersion}"

                            // Git vorbereiten
                            sh 'git restore .'
                            sh 'git config user.name "ssejenkins"'
                            sh 'git config user.email "jenkins@sse.uni-hildesheim.de"'
							// would be nicer if URL is not hardcoded here but comes directly from the checkout stage
                            sh 'git remote set-url origin git@github.com:e-learning-by-sse/nm-self-learning.git'


                            // Postgres + Sidecar für Build und Tests
                            withPostgres([
                                dbUser: env.POSTGRES_USER,
                                dbPassword: env.POSTGRES_PASSWORD,
                                dbName: env.POSTGRES_DB
                            ]).insideSidecar("${NODE_DOCKER_IMAGE}", "${DOCKER_ARGS}") {
                                sh 'npm run seed'
                                sh "env TZ=${env.TZ} npx nx run-many --target=build --all --skip-nx-cache"
                                sh "npm version ${newVersion}"
                            }

							build job: 'docs/sphinx',
								wait: true,
								propagate: true,
								parameters: [
								  string(name: 'DOCKER_VERSION', value: "${env.VERSION}"),
								  booleanParam(name: 'LATEST', value: true),
								]

                            sshagent(['STM-SSH-DEMO']) {
                                 sh "GIT_SSH_COMMAND='ssh -o StrictHostKeyChecking=no' git push origin v${newVersion}"
                            }

                            // Docker-Build und Publish
                            ssedocker {
                                create {
                                    target "${env.TARGET_PREFIX}:${params.RELEASE_LATEST_VERSION}"
                                }
                                publish {
                                    tag "latest"
                                }
                            }
                        }

                    }
                }
            }
        }
    }
}
