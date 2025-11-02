import copy


class SimpleAttributeDict(dict):
    def __getattr__(self, item):
        return self[item]

    def __copy__(self):
        return SimpleAttributeDict(copy.copy(dict(self)))

    def __deepcopy__(self, memo):
        return SimpleAttributeDict(copy.deepcopy(dict(self), memo))
