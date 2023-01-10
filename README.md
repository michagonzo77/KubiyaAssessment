# 1. Install a local Kubernetes cluster on your computer.

To install a local Kubernetes cluster on your local pc, begin with downloading Docker Desktop if you don’t already have it installed. Run the installer and follow the instructions.

Go to the settings in Docker and enter the Kubernetes tab. Click the enable Kubernetes checkbox. Once Kubernetes shows as running on the bottom left of Docker Desktop, exit the settings and check if Kubernetes is running by using the following command in a terminal: kubectl version --output=yaml|json (yaml or json)

# 2. Create a simple "Hello World" web application in a programming language of your choice.
We are going to be building a simple Hello World web app using Node.js with the Express framework.

Change the directory into the directory where you want the folder to live. In the terminal, run the command mkdir HelloWorld. Change into the HelloWorld directory and create a file named app.js using the touch command. Open the directory in a code editor and edit app.js to be the following:<br></br>

*const express = require('express')*

*const app = express()*

*app.get('/', (req, res) => {
    res.send('Hello, World!')
})*

*app.listen(3001, () => {
    console.log('Application listening on port 3001')
})*<br></br>

Inside the root folder of HelloWorld, in the terminal, run the command npm install express. You can test the application by running the command node app.js. Check if “Hello World” is seen on http://localhost:3001

# 3. Containerize the application using Docker.
Create an empty file named Dockerfile in the root of the folder. Edit the Dockerfile to contain the following:<br></br>

*FROM node:16.17.0-alpine

*WORKDIR /app*

*COPY package.json .*

*RUN npm install*

*COPY . .*

*EXPOSE 3001*

*CMD ["node", "app.js"]*<br></br>

To build the Docker image, run docker build -t hello-world . To run the Docker image, run docker run -p 3001:3001 hello-world

# 4. Build and push the Docker image to a registry.
Run the following two commands (username is your docker username && hello-world is interchangeable for what you want to call your app):<br></br>
  *docker tag hello-world username/hello-world*<br></br>
  *docker push username/hello-world*

# 5. Set up a version control system (e.g. Git) and host the code for the application in a repository (e.g. on GitHub).
Initialize a Git repository in the root of the application by running git init. Add all the files to the repository by running git add .. Commit the files with a message by running git commit -m "Hello World".

Go to GitHub and create a repository. Change the main branch name to main by running git branch -M main. Link your local repository to the remote repository on GitHub by running git remote add origin https://github.com/username/hello-world.git. Push to the remote repository by running git push -u origin main.

# 6. Set up monitoring for the application using a tool such as Prometheus and Grafana.
+ To set up monitoring for the application, first install Prometheus on your PC.
- For Windows, go to https://prometheus.io/download/ and download the latest version.
- Extract the folder after download.<br></br>
- CD into the directory that contains the prometheus.exe
- Start Prometheus by running the following command: <i>prometheus.exe --config.file prometheus.yml --web.listen-address ":9090" --storage.tsdb.path "data"</i>
- Verify installation by going to http://localhost:9090/
- Now install Grafana. Go to https://grafana.com/docs/grafana/latest/setup-grafana/installation/ and follow the instructions to download and install Grafana.
- To run Grafana, open your browser and go to the Grafana port http://localhost:3000/ - follow the instructions at https://grafana.com/docs/grafana/latest/getting-started/build-first-dashboard/ to create a dashboard.

# 7. Configure the monitoring tool to collect and display metrics about the application's performance and resource usage.
1. First we must edit our app.js to use the promClient library to have access to the metrics we want to track. In this case, CPU usage, memory usage, request count, etc.
2. 
    ```
    const express = require('express')
    const promClient = require('prom-client')
    const app = express()

    // Create a Gauge for CPU usage
    const cpuUsage = new promClient.Gauge({
        name: 'cpu_usage',
        help: 'Current CPU usage'
    })

    // Create a Gauge for memory usage
    const memoryUsage = new promClient.Gauge({
        name: 'memory_usage',
        help: 'Current memory usage'
    })

    // Update the Gauges every second
    setInterval(() => {
        // Update the CPU usage Gauge
        const cpuUsageValue = getCpuUsage()
        if (!isNaN(cpuUsageValue)) {
            cpuUsage.set(cpuUsageValue)
        }

        // Update the memory usage Gauge
        const memoryUsageValue = getMemoryUsage()
        if (!isNaN(memoryUsageValue)) {
            memoryUsage.set(memoryUsageValue)
        }
    }, 1000)

    const requestDuration = new promClient.Histogram({
        name: 'http_request_duration_seconds',
        help: 'Duration of HTTP requests in seconds',
        labelNames: ['route'],
        buckets: [0.1, 0.5, 1, 1.5]
    })

    app.use((req, res, next) => {
        const start = Date.now()

        res.on('finish', () => {
            const elapsed = Date.now() - start
            requestDuration.labels(req.route.path).observe(elapsed / 1000)
        })

        next()
    })

    app.get('/', (req, res) => {
        res.send('Hello, World!')
    })

    app.get('/metrics', async (req, res) => {
        res.set('Content-Type', promClient.register.contentType)

        try {
            const metrics = await promClient.register.metrics()
            res.end(metrics)
        } catch (error) {
            console.error(error)
            res.status(500).end('Internal Server Error')
        }
    })

    app.listen(3001, () => {
        console.log('Application listening on port 3001')
    })

    function getCpuUsage() {
        // Get the current system load and the number of available CPUs
        const load = os.loadavg()[0]
        const cpus = os.cpus().length

        // Calculate the current CPU usage as a percentage
        const usage = Math.round((load / cpus) * 100)

        return usage
    }

    function getMemoryUsage() {
        // Get the current process memory usage
        const usage = process.memoryUsage().heapUsed

        // Convert the memory usage to megabytes
        const usageMB = Math.round(usage / 1024 / 1024)

        return usageMB
    }
    ```
3. Now let’s create a Dashboard. On the left bar menu click New Dashboard and then Add a new panel
4. Make sure on the following page that Prometheus is selected as the Data source.
5. On the query tab add a Metric for: memory_usage, test with Run queries, and click save on the top right and give the dashboard a name.
6. Now on the top right, click the button with plus on it. Add a panel.
7. Now follow the same steps to add a metric for: cpu_usage. Click apply on top right when finished.
8. Follow the same steps to add a chart for “http_request_durations_seconds_count”. Click apply on top right when finished

BONUS
-------
# 1. Set up a build pipeline using a CI/CD tool (e.g. Jenkins, argo). 
  1. https://www.jenkins.io/download/#downloading-jenkins Download 2.375.1 LTS for Windows
      Follow the instructions on this page : Instructions
      Navigate to localhost:8080 or whichever port you selected when you installed and follow the steps to find the initial password and begin installing suggested plugins.
  2. Now we must configure Jenkins to access our source code repo.
  3. In step 3, we installed suggested plugins, ensure Git plugin successfully installed.
  4. Create First Admin User on Jenkins.
  5. On Jenkins dashboard, click on create new item. 
  6. Enter a name for the job and select “Pipeline”
  7. In Pipeline section, change to Pipeline script from SCM.
  8. Select Git for SCM and enter your repository URL.
  9. Change branch specifier to \*/main to match our git branch and scroll down and hit save.
  10. Now inside the root directory of the project create an empty file named Jenkinsfile, this is where our pipeline script will live.
  11. Head over to Jenkins dashboard, left hand menu - Manage Jenkins - Manage Plugins
  12. Click on available plugins, and search and install for the following plugins, we are going to need them later: Docker plugin, Docker Pipeline, Git plugin, Git client plugin, GitHub plugin, Kubernetes plugin, Kubernetes CLI, NodeJs
  13. Setup your docker within Manage Jenkins, Manage Nodes and Clouds, Configure Clouds.
  14. Add a new cloud - Docker. Name it docker and click Docker Cloud details.
  15. Set Docker Host URI to tcp://localhost:2375 and select Enabled.
  16. Now create docker credentials. Within Manage Jenkins, Manage Credentials, Create New Credentials, Select Global Jenkins, enter your username and your password for Docker.
  17. Give it a description to make it easier to find later.
  18. Copy the credentialsId from the main Credentials page and paste it into the withDockerRegistry line and the withDockerServer line.
  19. Edit the Jenkinsfile as followed:

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
                    withDockerRegistry([credentialsId: 'REPLACE WITH DOCKER CREDENTIALS', url: 'https://index.docker.io/v1/']) {
                        withDockerServer([credentialsId: 'REPLACE WITH DOCKER CREDENTIALS', uri: 'tcp://localhost:2375']) {
                            sh 'docker build -t username/hello-world:latest .'
                            sh 'docker push username/hello-world:latest'
                        }
                    }
                }
            }
        }
    }
## Configure the pipeline to automatically build and test the application whenever code is pushed to the repository.
  1. Within our job we created previously, we are going to click configure on the left side menu.
  2. Under build triggers, enable GitHub hook trigger for GITScm polling and press save.
  3. Now go back to Jenkins dashboard, Manage Jenkins, Configure System.
  4. Scroll down to find the section for GitHub Servers and click Add GitHub Server and select GitHub sServer.
  5. Set the API URL to https://api.github.com.
  6. Under credentials, click add and then Jenkins.
  7. Select Global credentials, and Secret text.
  8. If you don't already have one, go back to GitHub and create a Personal Access Token.
  9. Set your secret to your GitHub PAC and set a description to make it easier to find.
  10. Now select that newly created credential for credentials under the GitHub server.
  11. Enable Manage hooks and test connection to ensure your PAC is correct.
  12. Click the Advanced button outside of the dashes and we need to override Hook URL.
  13. Because your Jenkins server isn't accessible from the internet we need to expose the Jenkins server to the public internet.
  14. Download and install ngrok from https://ngrok.com/download
  15. Run ngrok.exe and start ngrok with *ngrok.exe http 8080*
  16. Follow the steps provided by ngrok to Auth your account by verifying email and running the command they provide.
  17. When completed run *ngrok.exe http 8080* again and we are going to grab the forwarding address for our GitHub Override hook url.
  18. Paste the ngrok forwarding address in Specify another hook URL for GitHub config, and close it /github-webhook/.
  19. Now copy that whole URL, http://{random-string}.ngrok.io/github-webhook/ and head over to your GitHub repository.
  20. Click settings, then webhooks on the left menu, and then Add webhook.
  21. Your Payload URL is going to be the URL from ngrok with /github-webhook/ at the end. 
  22. Set content type to application/json and save the webhook.

## Configure the pipeline to automatically deploy the application to the Kubernetes cluster whenever a new version is built and tested successfully. 
  1. We already have Docker Pipeline and Kubernetes installed from earlier.
  2. Update our Jenkinsfile. Add a stage after our Build and push stage:
  3. Head over to Jenkins Dashboard, Manage Jenkins, Manage nodes and clouds, Add a new cloud - Kubernetes.
  4. Name it kubernetes and click Kubernetes Cloud details.
  5. Set Kubernetes URL to https://kubernetes.docker.internal:6443
  6. Disable https certficate check.
  7. Enable WebSocket.
  8. Set Jenkins URL to http://localhost:8080
  9. Click Save.
  10. Now head to Manage Credentials and Add Credentials.
  11. Select Secret file for the Kind and browse your PC for your .kube folder and upload the config file. Give it a descriptive name you will remember.
  12. Head back to the main credentials page and copy the credentialsId for the KubeConfig file you just created.
  13. Find the credentialsId section in the code below and update with the credentialsId you just created.
    ```
    stage('Deploy to Kubernetes') {
        steps {
            withKubeConfig([credentialsId: 'REPLACE WITH KUBE CREDENTIALS', serverUrl: 'https://kubernetes.docker.internal:6443']) {
                sh 'kubectl apply -f deployment.yaml -f service.yaml'
            }
        }
    }
    ```
   14. Now we need to create deployment.yaml and service.yaml file in our applications root directory.
   15. Create an empty file named deployment.yaml and an empty file named service.yaml
   16. Use the code below to paste into each respective file. Make sure to update to your Docker username under spec/image.
      ### deployment.yaml
      ```
      apiVersion: apps/v1
      kind: Deployment
      metadata:
        name: hello-world
        labels:
          app: hello-world
      spec:
        replicas: 1
        selector:
          matchLabels:
            app: hello-world
        template:
          metadata:
            labels:
              app: hello-world
          spec:
            containers:
            - name: hello-world
              image: username/hello-world:latest
              ports:
              - containerPort: 3001
              env:
              - name: NODE_ENV
                value: production
```
      ### service.yaml
      ```
      apiVersion: v1
      kind: Service
      metadata:
        name: hello-world-service
      spec:
        selector:
          app: hello-world
        ports:
        - protocol: TCP
          port: 80
          targetPort: 3001
        type: LoadBalancer

```
# What additonal steps or considerations would be necessary to make this setup production-grade?
  I would start with running Jenkins on a dedicated machine or in the cloud, instead of on a local machine.
  In a production environment, security is important. We could implement securty plugins, such as Jenkins LDAP to prevent unauthorized access to Jenkins.
  Regularly update Jenkins and plugins to ensure we have the latest security fixes.
  Setup backup and recovery to protect against data loss.
  Using a reverse proxy server like Nginx can offload the resource intensive process of encrypting and decrypting traffic from the application server. A reverse proxy server can also be used as a firewall to filter out malicious traffic or for rate limiting.
  
