# Local Deployment


## Prereqs

1.) install Node.Js on your system

[NodeJs Download](https://nodejs.org/en/download)

2.) install docker engine and docker-compose

`CentOS`

```bash
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl start docker
```

`MacOS`

install docker desktop. This can be done by [Clicking Here](https://www.docker.com/products/docker-desktop/).

## Steps to Run through Docker

First make sure to generate the self signed certs in [@certs](../certs/) by following [CertGen](../certs/CertGen.md)

`docker-compose`

from the [@root](../) of the project, on the command line, run the following:
```bash
chmod +x ./startupDev.sh
./startupDev.sh
```

You will be prompted with `Init services for first time? (yes or no)`

If you haven't started the containers before, type `yes`. This will build all of the containers for you for the first time.


## Stopping the Services

from the [@root](../) of the project, on the command line, run the following:
```bash
chmod +x ./stopDev.sh
./stopDev.sh
```


## Removing Docker Containers

from [@root](../), run:

```bash
chmod +x ./stopandremovealldockercontainers.sh
./stopandremovealldockercontainers.sh
```


## Accessing in Dev

the api layer is segregated off from the world, with the haproxy being the single point of entry to access the apis beneath. The haproxy instance will bind to the hostname/ip of the host system and utilizes self signed certs to provide https/ssl access to the cluster. Haproxy handles load balancing requests to available systems, and uses a `least connection` approach when distributing requests.

Backend services have a path prefixed with `b_v1`, which just indicates backend version 1.

Self signed certs can be generated in the [@certs](../certs) folder, where directions are given. Since the certs are being generated for the particular hostname running the services, they can be bound directly to the container where haproxy is running.


## Sources

[etcd3testdockercompose](../docker-compose.etcd3test.yml)