pipeline {
    agent any
    tools {
        git 'Default'
        nodejs 'node'
    }
    environment {
        PATH = "${tool 'node'}/bin:${env.PATH}"
    }
    stages {
        stage('Build') {
            steps {
                bat """set JENKINS_NODE_COOKIE=dontKillMe && start /min npm install """
            }
        }
        stage('Test') {
            steps {
                bat """set JENKINS_NODE_COOKIE=dontKillMe && start /min npm test """
            }
        }
        stage('Build and push Docker image') {
            steps {
                withDockerRegistry([credentialsId: '164b0615-8c61-4199-9880-8160d59aed0d', url: 'https://index.docker.io/v1/']) {
                    withDockerServer([credentialsId: '164b0615-8c61-4199-9880-8160d59aed0d', uri: 'https://index.docker.io/v1/']) {
                        bat """set JENKINS_NODE_COOKIE=dontKillMe && start /min docker build -t michagonzo77/kubiya-assessment:latest . """
                        bat """set JENKINS_NODE_COOKIE=dontKillMe && start /min docker push michagonzo77/kubiya-assessment:latest """
                        bat """set JENKINS_NODE_COOKIE=dontKillMe && start /min docker run -p 3001:3001 michagonzo77/kubiya-assessment """
                    }
                }
            }
        }
        stage('Deploy to Kubernetes') {
            steps {
                withKubeConfig([credentialsId: 'e5326158-a848-40b4-bbc3-e144ec4ab299', serverUrl: 'https://kubernetes.docker.internal:6443']) {
                    bat """set JENKINS_NODE_COOKIE=dontKillMe && start /min kubectl apply -f deployment.yaml -f service.yaml """
                }
            }
        }
    }
}
