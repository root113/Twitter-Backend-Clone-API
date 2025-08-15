const Logger = {
    LOG_NVG: 'Navigated to ',
    LOG_ENDPOINT: 'Endpoint',
    LOG_CONTROLLER: 'Controller ',
    LOG_ROUTES: 'Routes ',
    LOG_SERVICE: 'Service ',
    LOG_TYPECHECK_FAIL: 'Primitive type check failed',
    LOG_USER_NOT_FOUND: 'User not found!',
    LOG_USER_FOUND: 'User exists in DB'
} as const;

export { Logger };