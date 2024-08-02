@Library('web-service-helper-lib') _

pipeline {
    agent { label 'docker' }

    environment {
        NODE_DOCKER_IMAGE = 'node:21-bullseye'
        
        NX_BASE='master'
        NX_HEAD='HEAD'
        TARGET_PREFIX = 'e-learning-by-sse/nm-self-learning'
        
        API_VERSION = packageJson.getVersion() // package.json must be in root level in order for this to work
        NPM_TOKEN = credentials('GitHub-NPM')
    }

    options {
        ansiColor('xterm')
    }

    stages { 
        stage("NodeJS Build") {
            agent {
                docker {
                    image "${env.NODE_DOCKER_IMAGE}"
                    reuseNode true
                    args '--tmpfs /.cache -v $HOME/.npm:/.npm'
                }
            }
            steps {
                sh 'git fetch origin master:master'
                sh 'cp .npmrc.example .npmrc'
                sh 'npm ci --force'
                sh 'cp -f .env.example .env'
                echo "TagBuild: ${buildingTag()}"
                script {
                    if (env.BRANCH_NAME =='master') { 
                        sh 'npm run build'
                    } else {
                        sh 'npm run build:affected'
                    }
                }
            }
        }
        stage('Tests') {
            environment {
                POSTGRES_DB = 'SelfLearningDb'
                POSTGRES_USER = 'username'
                POSTGRES_PASSWORD = 'password'
                DATABASE_URL = "postgresql://${env.POSTGRES_USER}:${env.POSTGRES_PASSWORD}@db:5432/${env.POSTGRES_DB}"
            }
            steps {
                script {
                    withPostgres([ dbUser: env.POSTGRES_USER,  dbPassword: env.POSTGRES_PASSWORD,  dbName: env.POSTGRES_DB ])
                            .insideSidecar("${NODE_DOCKER_IMAGE}", '--tmpfs /.cache -v $HOME/.npm:/.npm') {
                        sh 'npm run prisma db push'
                        if (env.BRANCH_NAME =='master') { 
                            sh 'npm run test:ci:full'
                        } else {
                            sh 'npm run test:ci:affected'
                        }
                    }
                }
            }
            post {
                success {
                    script {
                        if (env.BRANCH_NAME == 'master') {
                            // Test Results
                            junit 'output/test/junit*.xml'
                            // Coverage
                            discoverReferenceBuild()
                            recordCoverage(qualityGates: [[metric: 'LINE', threshold: 1.0], [metric: 'BRANCH', threshold: 1.0]], 
                                tools: [[parser: 'COBERTURA', pattern: 'output/test/coverage/cobertura-coverage.xml'], [parser: 'JUNIT', pattern: 'output/test/junit*.xml']],
                                sourceDirectories: [[path: 'libs'], [path: 'apps/site/pages'], [path: 'apps/site/components']])
                        }
                    }
                }
            }
        }
        stage('Publish Tagged Release') {
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
        stage('Publish and Deploy Unstable') {
            when {
                branch 'master'
            }
            steps {
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
        stage('Docker Publish Pull Requests') {
            environment {
                VERSION = "${env.API_VERSION}.${env.BRANCH_NAME.split('_')[-1]}"
            }
            when {
                anyOf {
                    expression { env.BRANCH_NAME.endsWith("_pb") }
                    changeRequest() // pull requests
                }
            }
            steps {
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
    }
}
