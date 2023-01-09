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
                withDockerRegistry([credentialsId: 'fbfdc3a8-f9c2-4a98-aeca-f2cb2c1efd7a', url: 'https://index.docker.io/v1/']) {
                    withDockerServer([credentialsId: 'fbfdc3a8-f9c2-4a98-aeca-f2cb2c1efd7a', uri: 'https://index.docker.io/v1/']) {
                        bat """set JENKINS_NODE_COOKIE=dontKillMe && start /min docker build -t index.docker.io/v1/hello-world:latest . """
                        bat """set JENKINS_NODE_COOKIE=dontKillMe && start /min docker push index.docker.io/v1/hello-world:latest """
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
