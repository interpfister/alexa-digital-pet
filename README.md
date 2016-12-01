# Alexa Digital Pet

This skill is based on the Scorekeeper example from the AWS SDK.

## Setup
To run this example skill you need to do two things. The first is to deploy the example code in lambda, and the second is to configure the Alexa skill to use Lambda.

### AWS Lambda Setup
1. Go to the AWS Console and click on the Lambda link. Note: ensure you are in us-east or you won't be able to use Alexa with Lambda.
2. Click on the Create a Lambda Function or Get Started Now button.
3. Skip the blueprint
4. Name the Lambda Function "Score-Keeper-Example-Skill".
5. Select the runtime as Node.js
6. Go to the the src directory, select all files and then create a zip file, make sure the zip file does not contain the src directory itself, otherwise Lambda function will not work.
7. Select Code entry type as "Upload a .ZIP file" and then upload the .zip file to the Lambda
8. Keep the Handler as index.handler (this refers to the main js file in the zip).
9. Select "Create a custom role" to create a role with lambda linked to DynamoDB.
    9a. In a new browser tab go to Services / Security & Identity / IAM
    9b. On the left tab select "Roles" and click the "Create New Role"
    9c. Enter role name "lambda-Dynamo", in the next screen select "AWS Lambda" under AWS Services Roles.
    9d. In the searchbar filter for Dynamo and select AmazonDynamoDBFullAccess and create role.
10. Return to the Lambda Management Console and under Role select "Choose an existing role" and select the new role you created: "lambda-Dynamo". Leave the Advanced settings as the defaults.
11. Click "Next" and review the settings then click "Create Function"
12. Click the "Triggers" tab and select "Add trigger"
13. Set the Trigger type as Alexa Skills kit and Enable it now. Click Submit.
14. Copy the ARN from the top right to be used later in the Alexa Skill Setup.

### AWS DynamoDB Setup
1. Go to the AWS Console and click on [DynamoDB link](https://console.aws.amazon.com/dynamodb). Note: ensure you are in us-east (same as your Lambda)
2. Click on CreateTable: set "ScoreKeeperUserData" as the table name, use Hash for the primary key type and set "CustomerId" as the hash attribute name.
3. Continue the steps with the default settings to finish the setup of DynamoDB table.

### Alexa Skill Setup
1. Go to the [Alexa Console](https://developer.amazon.com/edw/home.html) and click Add a New Skill.
2. Set "DigitalPet" for the skill name and "digipet" as the invocation name, this is what is used to activate your skill. For example you would say: "Alexa, Ask digipet how is Dazzle doing."
3. Select the Lambda ARN for the skill Endpoint and paste the ARN copied from above. Click Next.
4. Copy the custom slot types from the customSlotTypes folder. Each file in the folder represents a new custom slot type. The name of the file is the name of the custom slot type, and the values in the file are the values for the custom slot.
5. Copy the Intent Schema from the included IntentSchema.json.
6. Copy the Sample Utterances from the included SampleUtterances.txt. Click Next.
7. [optional] go back to the skill Information tab and copy the appId. Paste the appId into the scoreKeeper.js file for the variable APP_ID,
   then update the lambda source zip file with this change and upload to lambda again, this step makes sure the lambda function only serves request from authorized source.
8. You are now able to start testing your sample skill! You should be able to go to the [Echo webpage](http://echo.amazon.com/#skills) and see your skill enabled.
9. In order to test it, try to say some of the Sample Utterances from the Examples section below.
10. Your skill is now saved and once you are finished testing you can continue to publish your skill.


### Testing
To test the application, see the scripts available in src/package.json.