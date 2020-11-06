import { UNPAID_STATE, WIZARD_ENABLED } from '../../constants';
import { API_CUSTOM_ERROR_CODES } from '../../errors';

/* @ngInject */
function signupUserProcess(
    $location,
    AppModel,
    dispatchers,
    gettextCatalog,
    settingsApi,
    signupModel,
    authentication,
    attachSignupSubscription,
    lazyLoader,
    notification,
    Address,
    authApi,
    $state,
    setupKeys
) {
    const CACHE = {};
    const { dispatcher } = dispatchers(['signup']);
    const dispatch = (type, data = {}) => dispatcher.signup(type, data);

    async function doCreateUser(model) {
        console.log(`[Call] signupUserProcess.doCreateUser()`);//\n${JSON.stringify(model, null, 2)}`);
        dispatch('create.user', { value: true });
        try {
            const { data } = await signupModel.createUser(model);
            console.log(`[Return] signupUserProcess.doCreateUser()\n${JSON.stringify(data, null, 2)}`);
            return data;
        } catch (e) {
            const { data = {} } = e;

            // Failed Human verification
            if (
                [API_CUSTOM_ERROR_CODES.USER_CREATE_TOKEN_INVALID, API_CUSTOM_ERROR_CODES.ALREADY_EXISTS].includes(
                    data.Code
                )
            ) {
                dispatch('creating', { value: false });
                dispatch('chech.humanity', { value: true });

                if (data.Code === API_CUSTOM_ERROR_CODES.ALREADY_EXISTS) {
                    notification.error(data.Error);
                }
            }

            throw e;
        }
    }

    function setUserLanguage() {
        console.log('[Call] signupUserProcess.setUserLanguage()');
        if ($location.search().language) {
            return settingsApi.updateLocale({ Locale: gettextCatalog.getCurrentLanguage() });
        }
        console.log('[Return] signupUserProcess.setUserLanguage()');
    }

    async function doLogUserIn() {
        console.log('[Call] signupUserProcess.doLogUserIn()');
        dispatch('loguserin', { value: true });
        const credentials = {
            username: signupModel.get('username'),
            password: signupModel.getPassword()
        };
        await authentication.loginWithCookies(credentials);
        console.log('[Return] signupUserProcess.doLogUserIn()');
    }

    async function doAccountSetup() {
        console.log('[Call] signupUserProcess.doAccountSetup()');
        dispatch('setup.account', { value: true });

        const { data } = await Address.setup({ Domain: signupModel.getDomain() });

        CACHE.setupPayload.keys[0].AddressID = data.Address.ID;

        await setupKeys.setup(CACHE.setupPayload, signupModel.getPassword());

        authentication.setPassword(CACHE.setupPayload.mailboxPassword);
        console.log('[Return] signupUserProcess.doAccountSetup()');
    }

    async function doGetUserInfo() {
        console.log('[Call] signupUserProcess.doGetUserInfo()');
        dispatch('user.get', { value: true });
        await lazyLoader.app();
        const result = await authentication.fetchUserInfo();
        console.log(`[Return] signupUserProcess.doGetUserInfo()\n${JSON.stringify(result, null, 2)}`);
        return Promise.resolve(result);
    }

    function finishRedirect() {
        dispatch('user.finish', { value: true });

        delete CACHE.setupPayload;
        if (authentication.user.Delinquent < UNPAID_STATE.DELINQUENT) {
            return $state.go('secured.inbox', { welcome: WIZARD_ENABLED });
        }

        return $state.go('secured.dashboard');
    }

    const doSubscription = async () => {
        console.log('[Call] signupUserProcess.doSubscription()');
        // Attach subscription and catch any error to keep the same behavior as before (to redirect to the inbox).
        await attachSignupSubscription({
            planIds: signupModel.get('temp.planIds'),
            payment: signupModel.get('temp.payment'),
            method: signupModel.get('temp.method')
        }).catch((e) => console.error(e));
        console.log('[Return] signupUserProcess.doSubscription()');
    };

    const create = async (model) => {
        await doCreateUser(model);
        await doLogUserIn();
        await doAccountSetup();
        await doSubscription();
        await setUserLanguage();
        await doGetUserInfo();

        signupModel.clear();

        return finishRedirect();
    };

    async function generateNewKeys() {

        console.log('[Call] signupUserProcess.generateNewKeys()');

        dispatch('generate.newkeys', { value: true });

        const result = await setupKeys
            .generate([{ ID: 0, Email: signupModel.getEmail() }], signupModel.getPassword())
            .then((result) => (CACHE.setupPayload = result));

        console.log(`[Return] signupUserProcess.generateNewKeys()`);//\n${JSON.stringify(result, null, 2)}`);

        return Promise.resolve(result);
    }

    const createAccount = (model) => {
        console.log(`[Call] signupUserProcess.createAccount()`);
//model: ${JSON.stringify(model, null, 2)}`);
        dispatch('signup.error', { value: false });
        create(model).catch(() => {
            dispatch('signup.error', { value: true });
        });
        console.log('[Return] signupUserProcess.createAccount()');
    };

    return { createAccount, generateNewKeys };
}
export default signupUserProcess;
