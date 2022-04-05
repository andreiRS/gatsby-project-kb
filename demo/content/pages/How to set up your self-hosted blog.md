# How to set up your self-hosted blog

## Set up a Google Cloud Instance

- Create an account at [Compute Engine: Virtual Machines (VMs)  |  Google Cloud](https://cloud.google.com/compute). Checkout their [Free Trial and Free Tier](https://cloud.google.com/free) -  [Google Cloud Free Program](https://cloud.google.com/free/docs/gcp-free-tier).
- If you don't have a project you can create one [here](https://console.cloud.google.com/projectcreate) 
- Go to the "[Create an instance"](https://console.cloud.google.com/compute/instancesAdd) screen.
	- Define a name for your instance
	- Select the **region and zone** where you want this instance to run (e.g. us-central1)
	- Select **General Purpose** for the machine family configuration
	- From the **Series** dropdown select **N1** option and **f1-micro** for the **machine type**
	- **Change Boot Disk** to Ubuntu 20 Minimal and **Boot disk type** to Standard persistant disk.
	- In the firewall section select **Allow HTTP and HTTPS traffic**

The configuration should look like:
![](../assets/google-cloud-screenshoot-1.png)
![](../assets/google-cloud-screenshoot-2.png)
![](../assets/google-cloud-screenshoot-3.png)

### Define a static IP
- **View network details** by clicking on the three dots to the right of your newly created instance
- Open the **External IP addresses** screen
- Press the **Reserve Static Address** button

### Configure your DNS records
Add the following entries to your DNS configuration on your domain provider:

```
@   A     0.0.0.0
www CNAME yourdomain.com
```

Replace `0.0.0.0` with your instance external IP and `yourdomain.com` with the domain you want to link to this machine.

### Extend memory using a swap storage

Connect to the machine by clicking on the **SSH** button

Add Swap Space

```bash
sudo fallocate -l 1.2G /swapfile

# Allow Root Access:
sudo chmod 600 /swapfile

# Set up a Linux swap area
sudo mkswap /swapfile
```

Make changes permanent by appending to `/etc/fstab` this line:

```bash
/swapfile swap swap defaults 0 0
```

Congratulation you have your cloud instance running! 🎉

## Set up Nginx and Docker
### Install Nginx
```bash
sudo apt-get update

sudo apt install -y nginx
```

If you access your server though the browser you should see the default nginx message:

- [ ] Add Screenshot

### Install docker
Update `apt` package index
```bash
sudo apt-get update

sudo apt-get install \
    ca-certificates \
    curl \
    gnupg \
    lsb-release
```

Add Docker's official GPG key:
```bash
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
```

Add Docker's stable repository:
``` bash
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

```

Install Docker Engine
```bash
sudo apt-get update

sudo apt-get install docker-ce docker-ce-cli containerd.io
```

Verify Docker is working
```bash
sudo docker run hello-world
```

You should see this message:

- [ ] Add Screenshot

Official Documentation: [Install Docker Engine on Ubuntu | Docker Documentation](https://docs.docker.com/engine/install/ubuntu/)

### Install and Deploy Ghost

Pull the latest ghost image
```bash
sudo docker pull ghost:latest
```

Configure ghost
```bash
mkdir ghost_blog

echo '{
  "url": "http://yourdomain-or-ip",
  "server": {
    "port": 2368,
    "host": "0.0.0.0"
  },
  "database": {
    "client": "sqlite3",
    "connection": {
      "filename": "/var/lib/ghost/content/data/ghost.db"
    }
  },
  "mail": {
    "transport": "Direct"
  },
  "logging": {
    "transports": [
      "file",
      "stdout"
    ]
  },
  "process": "systemd",
  "paths": {
    "contentPath": "/var/lib/ghost/content"
  }
}' >> ghost_blog/config.json

```

Create a run script
```bash
echo '# Set path variables
DATA_DIR="$PWD/ghost_blog"
CONTAINER_NAME="ghost_blog"

# Purge the existing container if running.
docker kill $CONTAINER_NAME
docker rm $CONTAINER_NAME

# Mount the volumes - content directory and config file
# and add the url variable for docker map as the public URL
docker run \
-d \
--restart=always \
-p 80:2368 \
-e url="http://yourdomain-or-ip" \
-v $DATA_DIR/content:/var/lib/ghost/content \
-v $DATA_DIR/config.json:/var/lib/ghost/config.production.json \
--name $CONTAINER_NAME \
ghost' >> run.sh
```

Run the script
```bash
sudo sh ./run.sh
```

Ignore the initial error.

Open in browser `http://yourdomain-or-ip/ghost` and follow the instructions


### Point your domain at your google cloud instance

Go to `/etc/nginx/sites-available`.

Create a new entry for your domain:

```bash
sudo vi yourdomain.com.conf
```

Add the following content to the file:

```bash
# /etc/nginx/sites-available/yourdomain.com.conf

server {
root /var/www/html;
        listen 80; 
        listen [::]:80;
        server_name yourdomain.com www.yourdomain.com;
        location / {
            proxy_pass         http://127.0.0.1:8080;
            proxy_redirect     off;
            proxy_set_header   Host $host;
            proxy_set_header   X-Real-IP $remote_addr;
            proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header   X-Forwarded-Host $server_name;
            proxy_set_header   X-Forwarded-Proto $scheme;
        }
}

```

Add a symlink to the configuration into the `sites-enabled`  folder
```bash
sudo ln -s /etc/nginx/sites-available/yourdomain.com.conf /etc/nginx/sites-enabled/yourdomain.com.conf
```

Restart nginx:
```bash
sudo service nginx restart
```

### Set up HTTPS using Encrypt

`Snapd` is a software packaging and deployment system that works across Linux distributions. It comes preinstalled on Ubuntu and we can use it to install `Certbot` for setting up the Encrypt certificate.

Ensure `snapd` is up to date:

```bash
sudo snap install core; sudo snap refresh core
```

Install Certbot:
```bash
sudo snap install --classic certbot

sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

Install certificates:
```bash
sudo certbot --nginx
```

Test automatic renewal
```bash
sudo certbot renew --dry-run
```

To verify the domain is working, open it on your browser and you should see it running under `https` without any warnings.

If you need help check out [Certbot Instructions | Certbot](https://certbot.eff.org/instructions?ws=nginx&os=ubuntufocal)


## Sources and credits
- [Setup a Free Self-hosted Blog in Under 15 Minutes!](http://www.theappliedarchitect.com/setup-a-free-self-hosted-blog-in-under-15-minutes/)
- [How to Point your Domain at a Google Cloud Instance - YouTube](https://www.youtube.com/watch?v=y0VgnNbCneU&t=66s)
- [Set up HTTPS using Let's Encrypt and NGINX - YouTube](https://www.youtube.com/watch?v=T7flzYEtMGA&t=191s)
 

---
links: [[Tech]], #coding, #output/blog  