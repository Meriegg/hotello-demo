"use client";

import { useState } from "react";
import { Loader } from "~/components/ui/loader";
import { api } from "~/trpc/react";

export const Analytics = () => {
  const begginingOfCurrentMonthDate = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1,
  );
  const [startDate, setStartDate] = useState(
    begginingOfCurrentMonthDate,
  );
  const [endDate, setEndDate] = useState<Date | null>(null);

  const { isLoading, data } = api.admin.getAnalyticsData.useQuery({
    startDate,
    endDate,
  });

  if (isLoading) {
    return <Loader label="Fetching data" />;
  }

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
};
