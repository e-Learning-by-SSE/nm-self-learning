@Library('web-service-helper-lib') _

pipeline {
    agent { label 'docker' }

    environment {
        TARGET_PREFIX = 'e-learning-by-sse/nm-self-learning'
        API_VERSION = packageJson.getVersion() // package.json must be in root level in order for this to work
    }

    stages { 
        stage("NodeJS Build") {
            agent {
                docker {
                    image 'node:18-bullseye'
                    reuseNode true
                    args '--tmpfs /.cache -v $HOME/.npm:/.npm'
                }
            }
            steps {
                sh 'npm ci --force'
                sh 'cp -f .env.example .env'
                sh 'npm run build'
            }
        }
        stage('Test') {
            environment {
                POSTGRES_DB = 'SelfLearningDb'
                POSTGRES_USER = 'username'
                POSTGRES_PASSWORD = 'password'
                DATABASE_URL = "postgresql://${env.POSTGRES_USER}:${env.POSTGRES_PASSWORD}@db:5432/${env.POSTGRES_DB}"
            }
            steps {
                script {
                    withPostgres([ dbUser: env.POSTGRES_USER,  dbPassword: env.POSTGRES_PASSWORD,  dbName: env.POSTGRES_DB ]).insideSidecar('node:18-bullseye', '--tmpfs /.cache -v $HOME/.npm:/.npm') {
                        sh 'npm run prisma db push'
                        sh 'npm run test:ci'
                    }
                }
            }
        }

        stage('Docker Publish Master') {
            when {
                allOf {
                    branch 'master'
                    expression { packageJson.isNewVersion() }
                }
            }
            steps {
				ssedocker {
					buildImage {
						target "${env.TARGET_PREFIX}:latest"
					}
					publish {
						additionalTag "${env.API_VERSION}"
					}
				}
            }
        }

        stage('Docker Publish Dev') {
            when {
                branch 'dev'
            }
            steps {
				ssedocker {
					buildImage { target "${env.TARGET_PREFIX}:unstable" }
					publish {}
                }
            }
            post {
                success {
                    stagingDeploy "bash /staging/update-compose-project.sh nm-self-learning"
                }
            }
        }

        stage('Docker Publish PB') {
            when {
                expression { env.BRANCH_NAME.startsWith("pb_") }
            }
            steps {
                script {
					def version = ["${env.API_VERSION}.${env.BRANCH_NAME.split('_')[-1]}"]
					ssedocker {
						buildImage { target "${env.TARGET_PREFIX}:${version}" }
						publish {}
					}
                }
            }
        }
    }
}
