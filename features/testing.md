## Testing

Test cases:

* create module assigns owner
* cannot access private module without membership
* owner always has full permissions
* invalid role is rejected
* create invite expires in 48h
* accept invite rejects expired token
* validateQuiz rejects invalid answers
* generatePlan rejects invalid AI output
* postgres repository maps rows to domain types
* listModules returns only visible modules for requester
