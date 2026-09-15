"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AccountIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/account/info/");
  }, [router]);

  return (
    <p className="d-account__loading" style={{ margin: 0 }}>
      正在进入账号中心…
    </p>
  );
}
