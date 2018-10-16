# Minimum acceptance tests

## Test cms-json on a naked Docker container

    $ docker run -p 3000:3000 -t -i node /bin/bash
    $ npm install cms-json -g
    $ cms-json
    
This should start cms-json

Then open <http://localhost:3000>

