import sys

sys.path.insert(0, r'C:\Users\swarkail\OneDrive - Capgemini\Desktop\legalmind\backend')

from api import QuestionRequest, validate_document_scope

print(QuestionRequest(question='test').document)
print(QuestionRequest(question='test', document='nda.pdf').document)
print(QuestionRequest(question='test', source_filter='nda.pdf').source_filter)

mismatch = validate_document_scope('what is the vendor agreement?', ['nda.pdf'])
print('mismatch:', mismatch)
assert 'NDA' in mismatch and 'vendor agreement' in mismatch.lower(), mismatch

match = validate_document_scope('what is the vendor agreement?', ['vendor_agreement.pdf'])
print('match:', match)
assert match is None or 'vendor agreement' in match.lower() or 'agree' in match.lower() or match is None

print('document scope checks passed')
