pipeline {
    agent none

    environment {
        DEMO_SERVER = '147.172.178.30'
        DEMO_SERVER_PORT = '8080'
    }

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
                            // Sidecar Pattern: https://www.jenkins.io/doc/book/pipeline/docker/#running-sidecar-containers
                            docker.image('postgres:14.3-alpine').withRun("-e POSTGRES_USER=${env.POSTGRES_USER} -e POSTGRES_PASSWORD=${env.POSTGRES_PASSWORD} -e POSTGRES_DB=${env.POSTGRES_DB}") { c ->
                                docker.image('postgres:14.3-alpine').inside("--link ${c.id}:db") {
                                    //sh 'until pg_isready; do sleep 5; done' // currently not working
                                    sh "sleep 20"
                                }
                                docker.image('node:18-bullseye').inside("--link ${c.id}:db") {
                                    sh 'npm run prisma db push'
                                    sh 'npm run test:ci'
                                }
                            }
                        }
                    }
                }

                stage('Docker Build') {
                    steps {
                        sh 'mv docker/Dockerfile Dockerfile'
                        script {
                            API_VERSION = sh(
                                script: "cat package.json | jq -r '.version'",
                                returnStdout: true
                            )
                            echo "API: ${API_VERSION}"
                            dockerImage = docker.build 'e-learning-by-sse/nm-self-learning'
                            docker.withRegistry('https://ghcr.io', 'github-ssejenkins') {
                                dockerImage.push("${API_VERSION}")
                                dockerImage.push('latest')
                            }
                        }
                    }
                }

                stage('Deploy') {
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
