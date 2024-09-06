@Library('web-service-helper-lib') _

pipeline {
    agent { label 'docker' }
    environment {
        NODE_DOCKER_IMAGE = 'node:21-bullseye'
        NX_BASE = 'master'
        NX_HEAD = 'HEAD'
        TARGET_PREFIX = 'e-learning-by-sse/nm-self-learning'
        NX_BRANCH = env.BRANCH_NAME.replace('PR-', '')

        API_VERSION = packageJson.getVersion() // package.json must be in the root level in order for this to work
        TZ = 'Europe/Berlin'
    }

    options {
        ansiColor('xterm')
    }
    stages {
        stage('NPM Install') {
            agent {
                docker {
                    image "${NODE_DOCKER_IMAGE}"
                    args '--tmpfs /.cache -v $HOME/.npm:/.npm'
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
                sh 'npm ci --force' // force for permission errors
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
                    agent { label 'jq' }
                    when {
                        branch 'master'
                    }
                    steps {
                        script {
                            def projectName = env.JOB_NAME.split('/')[0]
                            def branchJobName = env.JOB_NAME.split('/')[1]
                            def jobUrl = "${env.JENKINS_URL}job/${projectName}/job/${branchJobName}/lastSuccessfulBuild/git-2/api/json" // be aware /git/ is the git data of the jenkins library
                            def lastSuccessSHA = sh(
                                script: "curl ${jobUrl} | jq '.lastBuiltRevision.SHA1'",
                                returnStdout: true
                            ).trim()
                            withPostgres([dbUser: env.POSTGRES_USER, dbPassword: env.POSTGRES_PASSWORD, dbName: env.POSTGRES_DB])
                             .insideSidecar("${NODE_DOCKER_IMAGE}", '--tmpfs /.cache -v $HOME/.npm:/.npm') {
                                    sh 'npm run prisma:seed'
                                    sh "npx nx-cloud record -- nx format:check"
                                    // This line enables distribution
                                    // The "--stop-agents-after" is optional, but allows idle agents to shut down once the "e2e-ci" targets have been requested
                                    // sh "npx nx-cloud start-ci-run --distribute-on='3 linux-medium-js' --stop-agents-after='e2e-ci'"
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
                        changeRequest()
                    }
                    environment {
                        VERSION = "${env.API_VERSION}.${env.BRANCH_NAME.split('_')[-1]}"
                    }
                    steps {
                        // This line enables distribution
                        // The "--stop-agents-after" is optional, but allows idle agents to shut down once the "e2e-ci" targets have been requested
                        // sh "npx nx-cloud start-ci-run --distribute-on='3 linux-medium-js' --stop-agents-after='e2e-ci'"
                        script {
                            withPostgres([dbUser: env.POSTGRES_USER, dbPassword: env.POSTGRES_PASSWORD, dbName: env.POSTGRES_DB])
                             .insideSidecar("${NODE_DOCKER_IMAGE}", '--tmpfs /.cache -v $HOME/.npm:/.npm') {
                                sh 'npm run prisma:seed'
                                sh "npx nx-cloud record -- nx format:check"
                                sh "env TZ=${env.TZ} npx nx affected --base origin/${env.CHANGE_TARGET} -t lint test build e2e-c"
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

                stage('Release Tag') {
                    when {
                        buildingTag()
                    }
                    steps {
                        ssedocker {
                            create {
                                target "${env.TARGET_PREFIX}:latest"
                            }
                            publish {
                                tag "${env.API_VERSION}"
                            }
                        }
                    }
                }
            }
        }
    }
}
