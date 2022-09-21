#!/bin/bash
docker run -d -p 80:3000 -t self-learn -e DATABASE_URL="postgresql://username:password@localhost:5435/SelfLearningDb"
