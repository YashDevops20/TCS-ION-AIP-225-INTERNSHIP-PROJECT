const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

const TASKS_TABLE = process.env.TASKS_TABLE || 'AmityEduTrack_Tasks';

exports.handler = async (event) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    const path = event.resource;
    const httpMethod = event.httpMethod;

    try {
        if (httpMethod === 'GET' && path === '/tasks') {
            return await getTasks(event);
        } else if (httpMethod === 'POST' && path === '/tasks') {
            return await createTask(event);
        } else if (httpMethod === 'PUT' && path === '/tasks/{id}') {
            return await updateTask(event);
        } else if (httpMethod === 'DELETE' && path === '/tasks/{id}') {
            return await deleteTask(event);
        } else {
            return buildResponse(404, { message: 'Route not found' });
        }
    } catch (error) {
        console.error('Error processing request:', error);
        return buildResponse(500, { message: 'Internal Server Error' });
    }
};

async function getTasks(event) {
    const params = {
        TableName: TASKS_TABLE
    };
    const result = await dynamoDb.scan(params).promise();
    return buildResponse(200, result.Items);
}

async function createTask(event) {
    const body = JSON.parse(event.body);
    const newTask = {
        id: Date.now().toString(),
        title: body.title,
        desc: body.desc,
        date: body.date,
        priority: body.priority,
        completed: false,
        studentId: event.requestContext?.authorizer?.claims?.sub || 'demo-user'
    };

    const params = {
        TableName: TASKS_TABLE,
        Item: newTask
    };

    await dynamoDb.put(params).promise();
    return buildResponse(201, newTask);
}

async function updateTask(event) {
    const taskId = event.pathParameters.id;
    const body = JSON.parse(event.body);

    const params = {
        TableName: TASKS_TABLE,
        Key: { id: taskId },
        UpdateExpression: 'set completed = :c, title = :t, #d = :date',
        ExpressionAttributeNames: {
            '#d': 'date' // date is a reserved keyword in DynamoDB sometimes
        },
        ExpressionAttributeValues: {
            ':c': body.completed,
            ':t': body.title,
            ':date': body.date
        },
        ReturnValues: 'ALL_NEW'
    };

    const result = await dynamoDb.update(params).promise();
    return buildResponse(200, result.Attributes);
}

async function deleteTask(event) {
    const taskId = event.pathParameters.id;

    const params = {
        TableName: TASKS_TABLE,
        Key: { id: taskId }
    };

    await dynamoDb.delete(params).promise();
    return buildResponse(200, { message: 'Task deleted successfully', id: taskId });
}

function buildResponse(statusCode, body) {
    return {
        statusCode: statusCode,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    };
}
