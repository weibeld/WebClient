/* @ngInject */
function User($http, url, srp) {
    const requestURL = url.build('users');

    const create = (data, Password) => {
        console.log('User.create()');
        return srp.verify.post({ Password }, requestURL(), data);
    };
    const get = (config = {}) => {
        console.log('User.get()');
        return $http.get(requestURL(), config).then(({ data = {} } = {}) => data.User);
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
