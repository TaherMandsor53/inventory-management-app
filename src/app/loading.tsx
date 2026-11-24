import { Loader } from '@/components/ui/Loader';

export default function AppLoading() {
  return (
    <Loader
      variant="page"
      label="Loading workspace..."
      sublabel="Preparing inventory & order telemetry"
    />
  );
}
