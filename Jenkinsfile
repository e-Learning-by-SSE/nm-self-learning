pipeline {
    agent any

    tools {nodejs "NodeJS 16.13"}
    
    environment {
        DEMO_SERVER = '147.172.178.30'
        DEMO_SERVER_PORT = '8080'
        API_FILE = 'api-json'
        API_URL = "http://${env.DEMO_SERVER}:${env.DEMO_SERVER_PORT}/stmgmt/${env.API_FILE}"
    }
    
    stages {

        stage('Git') {
            steps {
                cleanWs()
                git 'https://github.com/Student-Management-System/self-learning.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Test') {
            environment {
                POSTGRES_DB = 'SelfLearningDb'
                POSTGRES_USER = 'postgres'
                POSTGRES_PASSWORD = 'admin'
                PORT = '5432'
            }
            steps {
                script {
                    // Sidecar Pattern: https://www.jenkins.io/doc/book/pipeline/docker/#running-sidecar-containers
                    docker.image('postgres:14.1-alpine').withRun("-e POSTGRES_USER=${env.POSTGRES_USER} -e POSTGRES_PASSWORD=${env.POSTGRES_PASSWORD} -e POSTGRES_DB=${env.POSTGRES_DB} -p ${env.PORT}:${env.PORT}") { c ->
                        sh 'npm run test'
                    }
                }
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build --prod'
                sh 'rm -f Self-Learning.tar.gz'
                // sh 'tar czf Self-Learning.tar.gz dist src test config package.json ormconfig.ts tsconfig.json'
            }
        }

        // Based on: https://medium.com/@mosheezderman/c51581cc783c
        stage('Deploy') {
            steps {
                sshagent(credentials: ['Stu-Mgmt_Demo-System']) {
                    sh """
                        # [ -d ~/.ssh ] || mkdir ~/.ssh && chmod 0700 ~/.ssh
                        # ssh-keyscan -t rsa,dsa example.com >> ~/.ssh/known_hosts
                        ssh -i ~/.ssh/id_rsa_student_mgmt_backend elscha@${env.DEMO_SERVER} <<EOF
                            cd ~/Self-Learning
                            git reset --hard
                            git pull
                            npm ci
                            cp -f ~/Self-Learning.env ~/Self-Learning/.env
                            npm run prisma db push --accept-data-loss
                            npm run prisma db seed
                            npm run build --prod
                            rm ~/.pm2/logs/npm-error.log
                            pm2 restart Self-Learning --wait-ready # requires project intialized with: pm2 start npm -- run start:demo
                            cd ..
                            sleep 30
                            ./chk_logs_for_err.sh
                            exit
                        EOF"""
                }
                findText(textFinders: [textFinder(regexp: '(- error TS\\*)|(Cannot find module.*or its corresponding type declarations\\.)', alsoCheckConsoleOutput: true, buildResult: 'FAILURE')])
            }
        }
        
        stage('Publish Results') {
            steps {
                archiveArtifacts artifacts: '*.tar.gz'
            }
        }

    }
    
    post {
        always {
             // Send e-mails if build becomes unstable/fails or returns stable
             // Based on: https://stackoverflow.com/a/39178479
             load "$JENKINS_HOME/.envvars/emails.groovy" 
             step([$class: 'Mailer', recipients: "${env.elsharkawy}, ${env.klingebiel}", notifyEveryUnstableBuild: true, sendToIndividuals: false])
             
             // Report static analyses
             recordIssues enabledForFailure: false, tool: checkStyle(pattern: 'output/eslint/eslint.xml')
        }
    }
}