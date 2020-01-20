const Secret = () => import('@/views/secret/Secret.vue');
const SecretNavBar = () => import('@/views/secret/SecretNavBar.vue');
const CredentialsGroup = () => import('@/views/secret/credentials-group/pages/CredentialsGroup.vue');
const Credentials = () => import('@/views/secret/credentials/Credentials.vue');
const AddCredentials = () => import('@/views/secret/credentials-group/pages/AddCredentials.template.vue');

export default {
    path: 'secret',
    name: 'secret',
    redirect: 'secret/credentials-group',
    meta: { label: 'Secret', breadcrumb: true },
    components: {
        lnb: SecretNavBar,
        main: Secret,
    },
    children: [
        {
            path: 'credentials-group',
            name: 'credentialsGroup',
            meta: { label: 'Credentials Group', breadcrumb: true },
            component: { template: '<router-view />' },
            children: [
                {
                    path: '/',
                    name: Symbol('/'),
                    component: CredentialsGroup,
                },
                {
                    path: './:id/add',
                    name: 'addCredentials',
                    meta: { label: 'Add Credentials' },
                    component: AddCredentials,
                },
            ],
        },
        {
            path: 'credentials',
            name: 'credentials',
            meta: { label: 'Credentials', breadcrumb: true },
            component: Credentials,
        },
    ],
};
