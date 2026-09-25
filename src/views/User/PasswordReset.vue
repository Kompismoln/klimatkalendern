<template>
  <section class="container mx-auto">
    <h1 class="">
      {{ $t("Password reset") }}
    </h1>
    <o-notification
      :title="$t('Error')"
      variant="danger"
      v-for="error in errors"
      :key="error"
      >{{ error }}</o-notification
    >
    <form @submit="resetAction">
      <o-field :label="$t('Password')">
        <o-input
          aria-required="true"
          required
          type="password"
          password-reveal
          minlength="6"
          v-model="credentials.password"
          expanded
          @input="resetErrors()"
        />
      </o-field>
      <o-field :label="$t('Password (confirmation)')">
        <o-input
          aria-required="true"
          required
          type="password"
          password-reveal
          minlength="6"
          v-model="credentials.passwordConfirmation"
          expanded
          @input="resetErrors()"
        />
      </o-field>
      <o-button type="submit" class="my-2" variant="primary">{{
        $t("Reset my password")
      }}</o-button>
    </form>
  </section>
</template>

<script lang="ts" setup>
import { RESET_PASSWORD } from "@/graphql/auth";
import { ILogin } from "@/types/login.model";
import RouteName from "@/router/name";
import { reactive, ref, computed } from "vue";
import { useMutation } from "@vue/apollo-composable";
import { useRouter } from "vue-router";
import { useHead } from "@/utils/head";
import { useI18n } from "vue-i18n";

const props = defineProps<{ token: string }>();

const { t } = useI18n({ useScope: "global" });
useHead({ title: computed(() => t("Password reset")) });

const credentials = reactive<{
  password: string;
  passwordConfirmation: string;
}>({
  password: "",
  passwordConfirmation: "",
});

const errors = ref<string[]>([]);

// rules = {
//   passwordLength: (value: string): boolean | string =>
//     value.length > 6 || "Password must be at least 6 characters long",
//   required: validateRequiredField,
//   passwordEqual: (value: string): boolean | string =>
//     value === this.credentials.password || "Passwords must be the same",
// };

// get samePasswords(): boolean {
//   return (
//     this.rules.passwordLength(this.credentials.password) === true &&
//     this.credentials.password === this.credentials.passwordConfirmation
//   );
// }

const router = useRouter();

const {
  mutate: resetPasswordMutation,
  onDone: resetPasswordMutationDone,
  onError: resetPasswordMutationError,
} = useMutation<{ resetPassword: ILogin }>(RESET_PASSWORD);

resetPasswordMutationDone(({ data }) => {
  if (data == null) {
    throw new Error("Data is undefined");
  }

  alert(
    t(
      "Your password has been successfully changed. You now need to logged-in with your new password."
    )
  );

  router.push({ name: RouteName.LOGIN });
  return;
});

resetPasswordMutationError((err) => {
  err.graphQLErrors.forEach(({ message }: { message: any }) => {
    errors.value.push(message);
  });
});

const resetErrors = () => {
  errors.value.splice(0);
};

const resetAction = (e: Event) => {
  e.preventDefault();
  resetErrors();

  if (credentials.password != credentials.passwordConfirmation) {
    errors.value.push(
      t("Password and confirmation password must be identical.")
    );
    return;
  }

  resetPasswordMutation({
    password: credentials.password,
    token: props.token,
  });
};
</script>
