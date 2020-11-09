/* @ngInject */
function Key($http, url, srp) {
    const requestURL = url.build('keys');

    const unload = ({ data }) => data;

    /**
     * Get public keys of the given emails addresses
     * @return {Promise}
     */
    const keys = async (params = {}) => {
        console.log('[Call] Key.keys()');
        const result = await $http.get(requestURL(), params).then(unload);
        console.log(`[Return] Key.keys()\n${result.Keys.map(key => key.PublicKey)}`);
        return Promise.resolve(result);
        
    };

    /**
     * Create a new key
     * @param {Object} params
     * @return {Promise}
     */
    const create = (params = {}) => {
        console.log('Key.create()');
        return $http.post(requestURL(), params);
    };
    /**
     * Install a new key for each address
     * @param {Object} data
     * @param {String} [Password]
     * @return {Promise}
     */
    const setup = async (data = {}, Password = '') => {
        console.log(`[Call] Key.setup()`);
//data: ${JSON.stringify(data, null, 2)}
//Password: ${Password}`);
        if (Password.length) {
            return srp.verify.post({ Password }, requestURL('setup'), data);
        }
        console.log(`[Executing] Key.setup()
KeySalt: ${data.KeySalt}
PrimaryKey: ${data.PrimaryKey}
Signature: ${data.AddressKeys[0].SignedKeyList.Signature}`);
        // Check the HTTP POST request in the Chrome dev tools to see what's submitted to the ProtonMail API
        const result = await $http.post(requestURL('setup'), data);
        console.log(`[Return] Key.setup()`);//\n${JSON.stringify(result, null, 2)}`);
        return Promise.resolve(result);
    };
    /**
     * Install a new key for each address
     * @param {Object} data
     * @param {String} [Password]
     * @return {Promise}
     */
    const reset = (data = {}, Password = '') => {
        console.log('Key.reset()');
        if (Password.length) {
            return srp.verify.post({ Password }, requestURL('reset'), data);
        }
        return $http.post(requestURL('reset'), data);
    };
    /**
     * Activate key
     * @param {String} keyID
     * @param {Object} params
     * @return {Promise}
     */
    const activate = (keyID, params = {}) => {
        console.log('Key.activate()');
        $http.put(requestURL(keyID, 'activate'), params);
    };
    /**
     * Update private key only, use for password updates
     * @param {Object} data
     * @param {String} [Password]
     * @return {Promise}
     */
    const updatePrivate = (data = {}, Password = '') => {
        console.log('Key.updatePrivate()');
        if (Password.length) {
            return srp.verify.put({ Password }, requestURL('private'), data);
        }
        return $http.put(requestURL('private'), data);
    };
    /**
     * Upgrade private key with incorrect metadata
     * @param {Object} data
     * @param {String} [Password]
     * @return {Promise}
     */
    const upgrade = (data = {}, Password = '') => {
        console.log('Key.upgrade()');
        if (Password.length) {
            return srp.verify.post({ Password }, requestURL('private', 'upgrade'), data);
        }
        return $http.post(requestURL('private', 'upgrade'), data);
    };
    /**
     * Make a private key primary, only for activated keys
     * @param {String} keyID
     * @param {Object} params
     * @return {Promise}
     */
    const primary = (keyID, params) => {
        console.log('Key.primary()');
        return $http.put(requestURL(keyID, 'primary'), params);
    };
    /**
     * Delete key
     * @param {String} keyID
     * @param {Object} params
     * @return {Promise}
     */
    const remove = (keyID, params) => {
        console.log('Key.remove()');
        return $http.put(requestURL(keyID, 'delete'), params);
    };
    /**
     * Get salts
     * @return {Promise}
     */
    const salts = async (config) => {
        console.log('[Call] Key.salts()');
        const result = await $http.get(requestURL('salts'), config).then(unload);
        console.log(`[Return] Key.salts()\n${JSON.stringify(result, null, 2)}`);
        return Promise.resolve(result);
    };
    /**
     * Update the key flags
     * @param {String} keyID
     * @param {Integer} params.Flags (bitmask: bit 0 enables verification, bit 1 enables encryption)
     * @param {Object} params.SignedKeyList
     * @return {Promise}
     */
    const flags = (keyID, params) => {
        console.log('Key.flags()');
        return $http.put(requestURL(keyID, 'flags'), params);
    };
    /**
     * reactive key
     * @param {String} keyID
     * @return {Promise}
     */
    const reactivate = (keyID, params) => {
        console.log('Key.reactivate()');
        $http.put(requestURL(keyID), params);
    };

    return { keys, create, setup, reset, primary, activate, updatePrivate, upgrade, remove, salts, reactivate, flags };
}
export default Key;
