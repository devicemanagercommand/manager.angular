
#### Register docker images to registry server
To register image
https://docs.docker.com/registry/deploying/

Tag<br>
> docker tag msapi localhost:5000/test-ms-api

Push<br />
>docker push localhost:5000/test-ms-api

Remove<br >
> docker image remove localhost:5000/test-ms-api

Pull <br>
> docker pull localhost:5000/test-ms-api


#### Remove Intermediate Images
docker image remove $(docker images -f "dangling=true" -q) -f 

#### Remove images with tag "prod"
docker image remove $(docker images -f reference='*prod' -q) -f 

#### Detiene los contenedores
docker stop $(docker ps -aq)

#### Remueve todos los contenerres
docker container rm $(docker container ls -aq) 

#### Exec in service
https://stackoverflow.com/questions/39362363/execute-a-command-within-docker-swarm-service

```bash
docker exec $(docker ps -q -f name=servicename) ls
docker exec -it $(docker ps -q -f name=servicename) sh #interactive
```

#### Deploy stack mgr
Deploy homologación<br>
```bash
docker stack deploy -c 'docker-compose.yml' -c 'docker-compose.production.yml' -c 'docker-compose.production.pre.yml' mgr
```

