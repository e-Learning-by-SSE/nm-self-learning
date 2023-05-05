pipeline {
    agent none
    stages {
        stage("NodeJS Builds") {
            agent {
                docker {
                    image 'node:18-bullseye'
                    label 'docker'
                    reuseNode true
                    args '--tmpfs /.cache -v $HOME/.npm:/.npm'
                }
            }
            stages {
                stage('Install Dependencies') {
                    steps {
                        sh 'npm ci --force'
                    }
                }

                stage('Compilation Test') {
                    steps {
                        sh 'cp -f .env.example .env'
                        sh 'npm run build'
                    }
                }
            }
        }
        stage("Docker-Based Builds") {
            agent {
                label 'docker && jq' //jq build dependency
            }

            stages {
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
                
                stage('Docker Publish') {
                    when {
                        expression { env.BRANCH_NAME ==~ /^(master|dev)|pb_.*/  }
                    }
                    environment {
                        DOCKER_TARGET = 'e-learning-by-sse/nm-self-learning'
                    }
                    steps {
                        script {
                            dockerImage = docker.build "${DOCKER_TARGET}"
                            env.API_VERSION = sh(
                               script: "cat package.json | jq -r '.version'",
                               returnStdout: true).trim()
                            echo "API: ${env.API_VERSION}"
                            docker.withRegistry('https://ghcr.io', 'github-ssejenkins') {
                                if (env.GIT_BRANCH == "master") {
                                   dockerImage.push("${env.API_VERSION}")
                                   dockerImage.push('latest')
                                }
                                if (env.GIT_BRANCH == "dev") {
                                   dockerImage.push('unstable')
                                }
                                if (env.GIT_BRANCH.startsWith("pb_")) {
                                   def publishTag = "${env.API_VERSION}" + "." + env.GIT_BRANCH.split('_')[-1] 
                                   dockerImage.push(publishTag);
                                }
                            }
                        }
                    }
                }

                stage('Deploy') {
                    environment {
                        DEMO_SERVER = '147.172.178.30'
                        DEMO_SERVER_PORT = '8080'
                    }
                    when {
                        branch 'dev'
                    }
                    steps {
                        sshagent(['STM-SSH-DEMO']) {
                            sh "ssh -o StrictHostKeyChecking=no -l elscha ${env.DEMO_SERVER} bash /staging/update-compose-project.sh nm-self-learning"
                        }
                    }
                }
            }
        }
    }
}
