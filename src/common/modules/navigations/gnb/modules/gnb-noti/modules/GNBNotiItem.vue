<template>
    <div class="gnb-noti-item">
        <p v-if="dateHeader"
           class="date-header"
        >
            {{ dateHeader }}
        </p>
        <div class="item-wrapper"
             @click="handleClickItem"
        >
            <span class="new-icon"
                  :class="{ invisible: isRead }"
            />
            <div class="contents-wrapper">
                <p class="title">
                    <p-i v-if="icon"
                         :name="icon"
                         width="1rem"
                         height="1rem"
                         class="mr-1"
                    />
                    <span>{{ title }}</span>
                </p>
                <div class="additional-text">
                    {{ occurred }} <span v-if="writer">· {{ writer }}</span>
                </div>
            </div>
            <p-icon-button v-if="deletable"
                           class="delete-button"
                           name="ic_close"
                           size="sm"
                           @click="handleClickDeleteButton"
            />
        </div>
    </div>
</template>

<script lang="ts">

import type { SetupContext } from 'vue';
import {
    computed,
    defineComponent, reactive, toRefs,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PI, PIconButton,
} from '@spaceone/design-system';
import dayjs from 'dayjs';

import { store } from '@/store';

interface Props {
    isRead: boolean;
    title: string;
    createdAt?: string;
    dateHeader?: TranslateResult | string;
    icon?: string;
    writer?: string;
    deletable: boolean;
}

export default defineComponent<Props>({
    name: 'GNBNotiItem',
    components: {
        PI,
        PIconButton,
    },
    props: {
        isRead: {
            type: Boolean,
            default: false,
        },
        title: {
            type: String,
            default: '',
        },
        createdAt: {
            type: String,
            default: '',
        },
        dateHeader: {
            type: String,
            default: undefined,
        },
        icon: {
            type: String,
            default: undefined,
        },
        writer: {
            type: String,
            default: undefined,
        },
        deletable: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }: SetupContext) {
        const state = reactive({
            timezone: computed(() => store.state.user.timezone),
            occurred: computed(() => {
                if (!props.createdAt) return '';
                return dayjs.tz(dayjs.utc(props.createdAt), state.timezone).format('YYYY-MM-DD HH:mm');
            }),
        });

        /* Event */
        const handleClickItem = () => {
            emit('select');
        };
        const handleClickDeleteButton = (event) => {
            event.stopPropagation();
            emit('delete');
        };

        return {
            ...toRefs(state),
            handleClickItem,
            handleClickDeleteButton,
        };
    },
});
</script>

<style lang="postcss" scoped>
.gnb-noti-item {
    margin: 0.125rem 0;
    .date-header {
        @apply text-gray-500;
        font-size: 0.75rem;
        font-weight: 700;
        line-height: 1.5;
        margin-top: 0.75rem;
        margin-bottom: 0.25rem;
        padding: 0 0.75rem;
    }
    .item-wrapper {
        @apply rounded-lg;
        display: flex;
        position: relative;
        align-items: baseline;
        cursor: pointer;
        padding: 0.5rem;

        @media (hover: hover) {
            &:hover {
                @apply bg-blue-100;
                .delete-button {
                    visibility: visible;
                }
            }
        }
        .new-icon {
            @apply bg-blue-500;
            min-width: 0.5rem;
            width: 0.5rem;
            height: 0.5rem;
            border-radius: 50%;
            margin-right: 0.125rem;
        }
        .contents-wrapper {
            flex-grow: 1;
            .title {
                font-size: 0.875rem;
                line-height: 1.25;
                font-weight: bold;
                text-transform: capitalize;
                vertical-align: middle;
                margin-bottom: 0.125rem;
            }
            .additional-text {
                @apply text-gray-400;
                margin-top: 0.125rem;
                font-size: 0.75rem;
                line-height: 1.5;
            }
        }
        .delete-button {
            visibility: hidden;
            position: absolute;
            top: 0.25rem;
            right: 0.5rem;
        }
    }
}
</style>
