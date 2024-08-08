```javascript
let data = {
    users: [
        {
            uId: 1,
            email: 'example@gmail.com',
            nameFirst: 'Hayden',
            nameLast: 'Jacobs',
            handleStr: 'haydenjacobs',
            password: 'hayden1password',
        },
        {
            uId: 2,
            email: 'example2@gmail.com',
            nameFirst: 'Hayden2',
            nameLast: 'Jacobs',
            handleStr: 'hayden2jacobs',
            password: 'hayden2password',
        }
    ],
    channels: [
        {
            channelId: 1
            name: 'Hayden',
            ownerMembers: [
                1,
            ],
            allMembers: [
                1,
            ],
            messages: [
                {
                messageId: 1,
                uId: 1,
                message: 'Hello world',
                timeSent: 1582426789,
                }
            ],
            public: true
        },
        {
            channelId: 2
            name: 'Hayden2',
            ownerMembers: [
                2,
            ],
            allMembers: [
                1,
                2,
            ],
            messages: [
                {
                messageId: 1,
                uId: 1,
                message: 'Hello world',
                timeSent: 1582426789,
                }
            ],
            public: false
        }
    ]
}
```

[Optional] short description: 