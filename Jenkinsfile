@Library('web-service-helper-lib') _

pipeline {
    agent any
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
                sh 'git fetch origin master:master' // for nx affected
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
                    when {
                        branch 'master'
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
                                script {
                                    def lastSuccessBuild = currentBuild.previousSuccessfulBuild
                                    def lastSuccessSHA = lastSuccessBuild?.getEnvVars()['GIT_COMMIT']
                                    sh "npx nx affected --base=${lastSuccessSHA} -t lint test build e2e-ci"
                                }
                            }
                        }
                        ssedocker {
                            create {
                                target "${env.TARGET_PREFIX}:unstable"
                                args "--build-arg NPM_TOKEN=${env.NPM_TOKEN}"
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
                                sh "npx nx affected --base origin/${env.CHANGE_TARGET} -t lint test build e2e-c"
                            }
                        }
                        ssedocker {
                            create {
                                target "${env.TARGET_PREFIX}:${env.VERSION}"
                                args "--build-arg NPM_TOKEN=${env.NPM_TOKEN}"
                            }
                            publish {}
                        }
                    }
                    post {
                        success {
                            catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
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
                                args "--build-arg NPM_TOKEN=${env.NPM_TOKEN}"
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
