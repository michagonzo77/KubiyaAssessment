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
                withDockerRegistry([credentialsId: '858b2025-94a5-4bfb-82d9-d9c96be7ec4c', url: 'https://index.docker.io/v1/']) {
                    withDockerServer([credentialsId: '858b2025-94a5-4bfb-82d9-d9c96be7ec4c', uri: 'https://index.docker.io/v1/']) {
                        bat """set JENKINS_NODE_COOKIE=dontKillMe && start /min docker build -t index.docker.io/v1/kubiya-assessment:latest . """
                        bat """set JENKINS_NODE_COOKIE=dontKillMe && start /min docker push index.docker.io/v1/kubiya-assessment:latest """
                    }
                }
            }
        }
        stage('Deploy to Kubernetes') {
            steps {
                withKubeConfig([credentialsId: 'f97b324c-556d-4676-8adf-7a5b36ece251', serverUrl: 'https://kubernetes.docker.internal:6443']) {
                    bat """set JENKINS_NODE_COOKIE=dontKillMe && start /min kubectl apply -f deployment.yaml -f service.yaml """
                }
            }
        }
    }
}
