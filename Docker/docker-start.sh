#!/bin/bash
docker run -d -p 80:3000 -e DATABASE_URL="postgresql://postgres:admin@192.168.2.138:5432/SelfLearningDb" -e NEXTAUTH_SECRET="A strong secret" self-learn
