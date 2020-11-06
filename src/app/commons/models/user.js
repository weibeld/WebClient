/* @ngInject */
function User($http, url, srp) {
    const requestURL = url.build('users');

    const create = async (data, Password) => {
        console.log(`[Call] User.create()
data: ${JSON.stringify(data, null, 2)}
password: ${Password}`);
        const result = await srp.verify.post({ Password }, requestURL(), data);
        console.log(`[Return] User.create()\n${JSON.stringify(result, null, 2)}`);
        return Promise.resolve(result);
    };
    const get = async (config = {}) => {
        console.log(`[Call] User.get()\nconfig: ${JSON.stringify(config, null, 2)}`);
        const result = await $http.get(requestURL(), config).then(({ data = {} } = {}) => data.User);
        console.log(`[Return] User.get()\n${JSON.stringify(result, null, 2)}`);
        return Promise.resolve(result);
    };
    const code = (params) => {
        console.log('User.code()');
        return $http.post(requestURL('code'), params);
    };
    const human = () => {
        console.log('User.human()');
        return $http.get(requestURL('human'));
    };
    const verifyHuman = (params) => {
        console.log('User.verifyHuman()');
        return $http.post(requestURL('human'), params);
    };
    const check = () => {
        console.log('User.check()');
        return (params) => $http.put(requestURL('check'), params);
    };
    const direct = () => {
        console.log('User.direct()');
        return $http.get(requestURL('direct'));
    };

    const lock = () => {
        console.log('User.lock()');
        return $http.put(requestURL('lock'));
    };
    const available = (params, config) => {
        console.log('User.available()');
        return $http.get(requestURL('available'), params, config);
    };
    const unlock = (credentials) => {
        console.log('User.unlock()');
        return srp.auth.put(credentials, requestURL('unlock'));
    };
    const password = (credentials) => {
        console.log('User.password()');
        return srp.auth.put(credentials, requestURL('password'));
    };
    const remove = (data) => {
        console.log('User.remove()');
        return $http.put(requestURL('delete'), data);
    };
    return {
        requestURL,
        available,
        create,
        get,
        code,
        human,
        verifyHuman,
        check,
        direct,
        lock,
        unlock,
        password,
        delete: remove
    };
}
export default User;
