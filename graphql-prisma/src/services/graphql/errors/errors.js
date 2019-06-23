import { createError } from 'apollo-errors';

const AuthenticationError = createError('AuthenticationError', { message: "" });
const AuthorizationError = createError('AuthorizationError', { message: 'Something went wrong.' });
const InputInvalidError = createError('InputInvalidError', { message: 'Invalid input received.' });
const NotFound = createError('NotFound', { message: '' });

export {
    AuthenticationError,
    AuthorizationError,
    InputInvalidError,
    NotFound
};