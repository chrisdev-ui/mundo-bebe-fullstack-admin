import React from "react";
import { IconBrandGoogle, IconBrandInstagram } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { loginWithGoogle, loginWithInstagram } from "@/lib/actions";

export const GoogleSignInButton: React.FC<{
  isPending: boolean;
}> = ({ isPending }) => {
  const handleClick = async () => {
    await loginWithGoogle();
  };
  return (
    <Button
      variant="outline"
      type="button"
      className="flex w-full gap-2.5"
      onClick={handleClick}
      disabled={isPending}
      aria-disabled={isPending}
    >
      <IconBrandGoogle size={25} />
      Iniciar con Google
    </Button>
  );
};

export const GoogleSignUpButton: React.FC<{
  isPending: boolean;
}> = ({ isPending }) => {
  const handleClick = async () => {
    await loginWithGoogle();
  };
  return (
    <Button
      variant="outline"
      type="button"
      className="flex w-full gap-2.5"
      onClick={handleClick}
      disabled={isPending}
      aria-disabled={isPending}
    >
      <IconBrandGoogle size={25} />
      Registrarse con Google
    </Button>
  );
};

export const InstagramSignInButton: React.FC<{
  isPending: boolean;
}> = ({ isPending }) => {
  const handleClick = async () => {
    await loginWithInstagram();
  };
  return (
    <Button
      variant="outline"
      type="button"
      className="flex w-full gap-2.5"
      onClick={handleClick}
      disabled={isPending}
      aria-disabled={isPending}
    >
      <IconBrandInstagram size={25} />
      Iniciar con Instagram
    </Button>
  );
};

export const InstagramSignUpButton: React.FC<{
  isPending: boolean;
}> = ({ isPending }) => {
  const handleClick = async () => {
    await loginWithInstagram();
  };
  return (
    <Button
      variant="outline"
      type="button"
      className="flex w-full gap-2.5"
      onClick={handleClick}
      disabled={isPending}
      aria-disabled={isPending}
    >
      <IconBrandInstagram size={25} />
      Registrarse con Instagram
    </Button>
  );
};
