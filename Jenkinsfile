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
                    withDockerServer([credentialsId: '164b0615-8c61-4199-9880-8160d59aed0d', uri: 'tcp://localhost:2375']) {
                        sh 'docker build -t michagonzo77/kubiya-assessment:latest .'
                        sh 'docker push michagonzo77/kubiya-assessment:latest'
                    }
                }
            }
        }
        stage('Deploy to Kubernetes') {
            steps {
                withKubeConfig([credentialsId: '23adf3a7-7b0b-4541-8c0f-e83ba563eec2', serverUrl: 'https://kubernetes.docker.internal:6443']) {
                    sh 'kubectl apply -f deployment.yaml -f service.yaml'
                }
            }
        }
    }
}
