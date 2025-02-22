<template>
    <section class="event-rule-action-form">
        <p class="title-wrapper">
            <i18n path="PROJECT.EVENT_RULE.DO">
                <template #actions>
                    <strong>{{ $t('PROJECT.EVENT_RULE.THESE_THINGS') }}</strong>
                </template>
            </i18n>
        </p>
        <div class="content-wrapper">
            <div class="form-box">
                <p class="label">
                    {{ $t('PROJECT.EVENT_RULE.SNOOZED_NOTIFICATIONS') }}
                </p>
                <div class="toggle-wrapper">
                    <span v-if="proxyActions.no_notification"
                          class="toggle-text"
                    >ON</span>
                    <p-toggle-button
                        :value="proxyActions.no_notification"
                        @change-toggle="onToggleChange"
                    />
                </div>
            </div>
            <div class="form-box mobile-block">
                <p class="label">
                    {{ $t('PROJECT.EVENT_RULE.PROJECT_ROUTING') }}
                </p>
                <project-select-dropdown project-selectable
                                         :selected-project-ids.sync="routingProjects"
                />
            </div>
            <div class="form-box mobile-block">
                <p class="label">
                    {{ $t('PROJECT.EVENT_RULE.PROJECT_DEPENDENCY') }}
                </p>
                <project-select-dropdown multi-selectable
                                         project-selectable
                                         :selected-project-ids.sync="dependentProjects"
                />
            </div>
            <div class="form-box urgency">
                <p class="label">
                    {{ $t('PROJECT.EVENT_RULE.URGENCY') }}
                </p>
                <div>
                    <p-radio v-for="(urgency, uIdx) in urgencyList"
                             :key="`urgency-${uIdx}`"
                             v-model="selectedUrgency"
                             :value="urgency.name"
                             class="mr-4"
                    >
                        {{ urgency.label }}
                    </p-radio>
                    <p-select-dropdown v-model="selectedUrgency"
                                       :items="urgencyList"
                    />
                </div>
            </div>
            <div class="form-box mobile-block">
                <p class="label">
                    {{ $t('PROJECT.EVENT_RULE.ASSIGNEE') }}
                </p>
                <p-filterable-dropdown class="user-search-dropdown"
                                       show-select-marker
                                       :menu="userItems"
                                       :selected.sync="selectedAssignee"
                />
            </div>
            <div class="form-box mobile-block">
                <p class="label">
                    {{ $t('PROJECT.EVENT_RULE.ADDITIONAL_RESPONDER') }}
                </p>
                <p-filterable-dropdown class="user-search-dropdown"
                                       :menu="userItems"
                                       :selected.sync="selectedResponder"
                                       multi-selectable
                                       appearance-type="stack"
                                       show-select-marker
                />
            </div>
            <div class="form-box additional-information">
                <tags-input-group show-header
                                  :tags="additionalInfoTags"
                                  @update-tags="handleUpdateAdditionalInformation"
                >
                    <template #add-button="{handleAddPair}">
                        <div class="top-part">
                            <p>{{ $t('PROJECT.EVENT_RULE.ADDITIONAL_INFORMATION') }}</p>
                            <p-button style-type="tertiary"
                                      icon-left="ic_plus_bold"
                                      class="mb-2"
                                      @click="handleAddPair($event)"
                            >
                                {{ $t('PROJECT.EVENT_RULE.ADD') }}
                            </p-button>
                        </div>
                    </template>
                </tags-input-group>
            </div>
        </div>
        <p-checkbox v-model="proxyOptions.stop_processing"
                    :value="true"
                    class="stop-processing-input"
        >
            {{ $t('PROJECT.EVENT_RULE.THEN_STOP_PROCESSING') }}
        </p-checkbox>
    </section>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs,
} from 'vue';

import {
    PToggleButton, PRadio, PButton, PCheckbox, PSelectDropdown, PFilterableDropdown,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import { store } from '@/store';
import { i18n } from '@/translations';

import type { UserReferenceMap } from '@/store/modules/reference/user/type';

import TagsInputGroup from '@/common/components/forms/tags-input-group/TagsInputGroup.vue';
import type { Tag } from '@/common/components/forms/tags-input-group/type';
import { useProxyValue } from '@/common/composables/proxy-state';
import ProjectSelectDropdown from '@/common/modules/project/ProjectSelectDropdown.vue';

const URGENCY = Object.freeze({
    NO_SET: 'NO_SET',
    HIGH: 'HIGH',
    LOW: 'LOW',
});

export default {
    name: 'EventRuleActionForm',
    components: {
        ProjectSelectDropdown,
        TagsInputGroup,
        PToggleButton,
        PRadio,
        PButton,
        PCheckbox,
        PSelectDropdown,
        PFilterableDropdown,
    },
    props: {
        actions: {
            type: Object,
            default: () => ({}),
        },
        options: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            users: computed<UserReferenceMap>(() => store.getters['reference/userItems']),
            userItems: computed(() => Object.keys(state.users).map((k) => ({
                name: k,
                label: state.users[k]?.label || k,
            }))),
            urgencyList: computed(() => ([
                {
                    name: URGENCY.NO_SET,
                    label: i18n.t('PROJECT.EVENT_RULE.NO_SET'),
                },
                {
                    name: URGENCY.HIGH,
                    label: i18n.t('PROJECT.EVENT_RULE.HIGH'),
                },
                {
                    name: URGENCY.LOW,
                    label: i18n.t('PROJECT.EVENT_RULE.LOW'),
                },
            ])),
            proxyActions: useProxyValue('actions', props, emit),
            proxyOptions: useProxyValue('options', props, emit),
            routingProjects: computed<string[]>({
                get() { return props.actions.change_project ? [props.actions.change_project] : []; },
                set(projectIds) {
                    state.proxyActions = {
                        ...state.proxyActions,
                        change_project: projectIds[0],
                    };
                },
            }),
            dependentProjects: computed<string[]>({
                get() { return props.actions.add_project_dependency || []; },
                set(projectIds) {
                    state.proxyActions = {
                        ...state.proxyActions,
                        add_project_dependency: projectIds,
                    };
                },
            }),
            selectedUrgency: computed({
                get() {
                    if (props.actions.change_urgency) {
                        return props.actions.change_urgency;
                    }
                    return URGENCY.NO_SET;
                },
                set(changeUrgency) {
                    state.proxyActions = {
                        ...state.proxyActions,
                        change_urgency: changeUrgency !== URGENCY.NO_SET ? changeUrgency : undefined,
                    };
                },
            }),
            selectedAssignee: computed<MenuItem[]>({
                get() {
                    const assignee: string = props.actions.change_assignee;
                    return assignee ? [{ name: assignee, label: assignee }] : [];
                },
                set(items) {
                    state.proxyActions = {
                        ...state.proxyActions,
                        change_assignee: items[0]?.name,
                    };
                },
            }),
            selectedResponder: computed<MenuItem[]>({
                get() {
                    return props.actions.add_responder.map((d) => ({
                        name: d.resource_id,
                        label: d.resource_id,
                    }));
                },
                set(items) {
                    state.proxyActions = {
                        ...state.proxyActions,
                        add_responder: items.map((item) => ({
                            resource_type: 'identity.User',
                            resource_id: item.name,
                        })),
                    };
                },
            }),
            additionalInfoTags: computed({
                get() { return props.actions.add_additional_info; },
                set(tags) {
                    state.proxyActions = {
                        ...state.proxyActions,
                        add_additional_info: tags,
                    };
                },
            }),
        });

        /* event */
        const onToggleChange = (value) => {
            state.proxyActions = {
                ...state.proxyActions,
                no_notification: value,
            };
        };
        const handleUpdateAdditionalInformation = (tags: Tag) => {
            state.additionalInfoTags = tags;
        };

        return {
            ...toRefs(state),
            onToggleChange,
            handleUpdateAdditionalInformation,
        };
    },
};
</script>

<style lang="postcss" scoped>
.title-wrapper {
    font-size: 1rem;
    line-height: 2;
    margin-bottom: 0.75rem;
}
.content-wrapper {
    @apply border border-gray-100 rounded-md;
    border-width: 0.25rem;
    font-size: 0.875rem;

    .form-box {
        @apply border-b border-gray-100;
        display: flex;
        min-height: 3.5rem;
        line-height: 1.5;
        align-items: center;
        justify-content: space-between;
        border-bottom-width: 0.25rem;
        padding: 1rem;
        &:last-child {
            border: none;
        }
        &.urgency {
            .p-select-dropdown {
                display: none;
            }
        }

        /* customize tags-input-group */
        :deep(&.additional-information) {
            display: block;
            .top-part {
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            .tag-header {
                display: none;
            }
        }

        .toggle-wrapper {
            @apply flex;
            .toggle-text {
                @apply text-secondary;
                padding-right: 0.5rem;
            }
        }
        .project-select-dropdown, .user-search-dropdown {
            width: 60%;
        }
    }
}
.stop-processing-input {
    display: block;
    text-align: right;
    padding-top: 0.75rem;
}

@screen tablet {
    .content-wrapper {
        .form-box {
            &.urgency {
                .p-radio {
                    display: none;
                }
                .user-search-dropdown {
                    display: block;
                }
            }
        }
    }
}

@screen mobile {
    .content-wrapper {
        .form-box {
            &.mobile-block {
                display: block;
                .label {
                    padding-bottom: 0.75rem;
                }
                .project-select-dropdown, .user-search-dropdown {
                    width: 100%;
                }
            }

            /* customize tags-input-group */
            :deep(&.additional-information) {
                .p-field-group {
                    width: 45%;
                }
            }
        }
    }
}
</style>
