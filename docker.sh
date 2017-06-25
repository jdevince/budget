cd frontend
sudo docker build -t budgetfrontend .
cd ../backend
sudo docker build -t budgetbackend .
sudo docker run -d -p 3000:3000 budgetfrontend
sudo docker run -d -p 5000:5000 budgetbackend
