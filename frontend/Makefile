build:
	docker image build -t nutchawit/cv19fp-frontend:2 .

push:
	docker push nutchawit/cv19fp-frontend

remove:
	docker container rm -f cv19fp-frontend
	sudo docker container rm -f cv19fp-frontend

run:
	docker run --name cv19fp-frontend -p 3000:3000 -d nutchawit/cv19fp-frontend:1

all: remove build run
