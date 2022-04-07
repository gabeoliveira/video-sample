
const pulumi = require("@pulumi/pulumi");
require('dotenv').config();

const { Resource, Serverless, CheckServerless, FlexPlugin } = require('twilio-pulumi-provider');


const stack = pulumi.getStack();


/*Initial Setup*/


/* TaskRouter Setup */

const flexWorkspace = new Resource("flex-workspace", {
    resource: ["taskrouter", "workspaces"],
    attributes: {
        friendlyName: 'Flex Task Assignment'
    }
});

const everyoneTaskQueue = new Resource("everyone-taskQueue", {
    resource: ["taskrouter", { "workspaces" : flexWorkspace.sid }, "taskQueues"],
    attributes: {
        friendlyName: 'Everyone',
        targetWorkers: `1==1`
    }
});



const workflow = new Resource("video-workflow", {
    resource: ["taskrouter", { "workspaces" : flexWorkspace.sid }, "workflows"],
    attributes: {
        friendlyName: 'Video Tasks Workflow',
        configuration: pulumi.all([everyoneTaskQueue.sid])
            .apply(([ everyoneTaskQueueSid ]) => JSON.stringify(
                {
                    task_routing: {
                        filters: [
                            {
                                friendlyName: "Target Worker",
                                expression: `1 == 1`,
                                targets: [
                                    {
                                        queue: everyoneTaskQueueSid,
                                        known_worker_sid: 'task.agent_sid'
                                    }   
                                ] 
                            }
                        ],
                        default_filter: {
                            queue: everyoneTaskQueueSid
                        }
                    }
                }
            ))
    },
});



/*Video Plugin*/

const videoPluginConversationService = new Resource('video-plugin-conversations-service', {
    resource: [
        'conversations',
        'services'
    ],
    attributes: {
        friendlyName: 'video-plugin-conversations-service'
    }
});

const videoPluginServiceName = 'plugin-video-backend';
const videoPluginDomain = CheckServerless.getDomainName(videoPluginServiceName, stack);

const videoPluginServerless = new Serverless("video-plugin-serverless", {
    attributes: {
      cwd: `./../plugin-video/plugin-video-backend`,
      serviceName: videoPluginServiceName,
      env: {
        KEY_SID: process.env.TWILIO_API_KEY_SID,
        KEY_SECRET:process.env.TWILIO_API_KEY_SECRET,
        TWILIO_WORKSPACE_SID: flexWorkspace.sid,
        TWILIO_VIDEO_WORKFLOW_SID: workflow.sid,
        CONVERSATION_SERVICE_SID: videoPluginConversationService.sid

      },    
      functionsEnv: stack,
      pkgJson: require("./../plugin-video/plugin-video-backend/package.json")
    }
});



export let output = {
    flexWorkspace: flexWorkspace.sid,
    workflow: workflow.sid,
    videoPluginConversationService: videoPluginConversationService.sid,
    videoPluginServerless: videoPluginServerless.sid
}