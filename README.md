
EOS Server
==========

Eos is simple log message dispatcher, that receives messages over UDP and then delivers them to all connected
clients using websockets

## EOS key scheme

Eos key contains three parts:

1. Realm name
2. Scheme. At this moment, EOS supports only `log` scheme
3. List of tags, separated using `:`. At least one tag mandatory

Example:

* `production+log://web-worker1:info`
* This key means `production` realm, `log` scheme and two tags: `web-worker1` and `info`

## UDP packet scheme

UDP packets is plaintext with newline delimiters
```
NONCE       // Random unique salt
HASH        // Signature of whole packet
EOS KEY     // Eos key to log
PAYLOAD     // 4-th and following lines are payload
```

Hash calculated using sha256:
`hash = NONCE + PAYLOAD + REALMSECRET`