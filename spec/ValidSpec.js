const app = require('../server'),
    request = require('supertest')

describe('Valid app', function() {
    const agent = request.agent(app)
    let id
    
    it('asks informations', function(done) {
        agent.get('/info/')
            .end(function(err, res) {
                expect(200)
                const version = res.body.version
                expect(version).not.toBeUndefined()
                done()
            })
    })
    
    it('connects to server', function(done){
        agent.post('/users/register/toto/')
			.end(function(err, res) {
				expect(200)
				id = res.body.id
				expect(id).not.toBeUndefined()
				done()
			})
    })
	
	it('asks who is a user', function(done) {
		agent.get('/users/whois/toto/')
			.end(function(err, res) {
				expect(200)
				const user = res.body
				expect(user).not.toBeUndefined()
				if (user !== undefined) {
					expect(user.nick).toBe('toto')
				}
				done()
			})
	})
    
    it('joins a channel', function(done) {
        agent.put('/user/' + id + '/channels/channel-1/join/')
            .end(function(err, res) {
                expect(200)
				const users = res.body
				expect(users).not.toBeUndefined()
				if (users !== undefined) {
					expect(users.length).toBe(1)
					if (users.length == 1) {
						expect(users[0].nick).toBe('toto')
					}
				}
				done()
            })
    })
    
    it('talks in channel', function(done) {
        agent.put('/user/' + id + '/channels/channel-1/say/')
            .send({ message: 'Hello, Channel 1!' })
            .end(function(err, res) {
                expect(200)
                const user = res.body
                expect(user).not.toBeUndefined()
                expect(user.id).toEqual(id)
				done()
            })
    })
    
    it('talks in another channel', function(done) {
        agent.put('/user/' + id + '/channels/channel-2/say/')
            .send({ message: 'Hello, Channel 2!' })
            .end(function(err, res) {
                expect(200)
                const user = res.body
                expect(user).not.toBeUndefined()
                expect(user.id).toEqual(id)
				done()
            })
    })
    
    it('sends a private message', function(done) {
        agent.put('/user/' + id + '/message/toto/')
            .send({ message: 'Private message' })
            .end(function(err, res) {
                expect(200)
                const user = res.body
                expect(user).not.toBeUndefined()
                expect(user.nick).toBe('toto')
                done()
            })
    })
    
    it('checks for notices', function(done) {
        agent.get('/user/' + id + '/notices/')
            .end(function(err, res) {
                expect(200)
                const notices = res.body
                expect(notices).not.toBeUndefined()
                expect(notices.length).toEqual(4)
				if (notices.length == 4) {
                    expect(notices[0].type).toEqual('channelJoin')
                    expect(notices[0].nick).toEqual('toto')
                    expect(notices[0].channel).toEqual('channel-1')
                    expect(notices[0].time).not.toBeUndefined()
                    if (notices[0].time !== undefined) {
                        expect(notices[0].time.length).toBe(24)
                    }

                    expect(notices[1].type).toEqual('channelMessage')
                    expect(notices[1].nick).toEqual('toto')
                    expect(notices[1].channel).toEqual('channel-1')
                    expect(notices[1].message).toEqual('Hello, Channel 1!')
                    expect(notices[1].time).not.toBeUndefined()
                    if (notices[1].time !== undefined) {
                        expect(notices[1].time.length).toBe(24)
                    }

                    expect(notices[2].type).toEqual('channelMessage')
                    expect(notices[2].nick).toEqual('toto')
                    expect(notices[2].channel).toEqual('channel-2')
                    expect(notices[2].message).toEqual('Hello, Channel 2!')
                    expect(notices[2].time).not.toBeUndefined()
                    if (notices[2].time !== undefined) {
                        expect(notices[2].time.length).toBe(24)
                    }

                    expect(notices[3].type).toEqual('privateMessage')
                    expect(notices[3].sender).toEqual('toto')
                    expect(notices[3].recipient).toEqual('toto')
                    expect(notices[3].message).toEqual('Private message')
                    expect(notices[3].time).not.toBeUndefined()
                    if (notices[3].time !== undefined) {
                        expect(notices[3].time.length).toBe(24)
                    }
				}
				done()
            })
    })
    
    it('disconnects', function(done) {
        agent.del('/user/' + id + '/disconnect/')
            .end(function(err, res) {
                expect(200)
                const version = res.body.version
                expect(version).not.toBeUndefined()
				done()
            })
    })
	
    it('asks for the list of channels after disconnecting', function(done) {
        agent.get('/channels/')
            .end(function(err, res) {
                expect(200)
                const channels = res.body
                expect(channels).not.toBeUndefined()
                if (channels !== undefined) {
                    expect(channels.length).toBe(0)
                }
                done()
            })
    })
})