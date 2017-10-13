const { createMessageAdapter } = require('@slack/interactive-messages');
const slackMessages = createMessageAdapter(process.env.SLACK_VERIFICATION_TOKEN);

const sendMessage = (robot, res, attachments) => {
  const client = robot.adapter.client;
  client.web.chat.postMessage(res.envelope.room, '', {
    as_user: true,
    link_names: 1,
    attachments,
  });
};

const sendMessageToResponseURL = (url, json) => {
  const postOptions = {
    uri: responseURL,
    method: 'POST',
    headers: {
      'Content-type': 'application/json'
    },
    json,
  };
  request(postOptions, (error, response, body) => {
    if (error){
      console.log(error);
    }
  });
};

module.exports = (robot) => {
  robot.respond(/quiz/i, (res) => {
    sendMessage(robot, res, [
      {
        fallback: '失敗しました',
        pretext: '問題です',
        attachment_type: 'default',
        callback_id: 'quiz',
        actions: [
          {
            name: 'quiz_answer',
            text: '1 + 1 = ?',
            type: 'select',
            options: [
              { text: '0', value: 0 },
              { text: '1', value: 1 },
              { text: '2', value: 2 },
              { text: '3', value: 3 },
            ]
          }
        ]
      }
    ]);
  });

  robot.router.use('/slack/receive', slackMessages.expressMiddleware());
  slackMessages.action('quiz', (payload) => {
    const replacement = payload.original_message;
    const action = payload.actions[0];
    const answer = action.selected_options[0].value;
    replacement.text = parseInt(answer, 10) === 2 ? '正解です' : '不正解です';
    delete replacement.attachments[0].actions;
    return replacement;
  });
};
