import SettingsShell from "@/components/SettingsShell";
import PageMountSignaler from "@/components/PageMountSignaler";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SettingsShell>{children}</SettingsShell>
      <PageMountSignaler />
    </>
  );
}
