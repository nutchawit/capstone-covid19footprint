build:
	docker image build -t nutchawit/cv19fp-frontend .

push:
	docker push nutchawit/cv19fp-frontend

remove:
	docker container rm -f cv19fp-frontend

run:
	docker run --name cv19fp-frontend -p 3000:3000 -d nutchawit/cv19fp-frontend

all: remove build run
