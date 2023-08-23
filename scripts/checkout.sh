git stash push -m "autocheckout" && git stash pop && git pull --rebase && git stash pop
npm install
skript_verzeichnis=$(dirname "$0")
bash "$skript_verzeichnis/db-setup.sh"