@echo off
echo Deploying Firestore rules...
firebase deploy --only firestore:rules
echo Done!
pause
