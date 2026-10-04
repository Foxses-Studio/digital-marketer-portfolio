import { getHeaderData } from "@/lib/cms/site";
import { HeaderClient } from "./header-client";

/**
 * Public site header. Reads CMS data on the server (cached until an admin
 * changes settings or navigation) and hands it to the interactive client
 * part.
 */
export async function SiteHeader() {
  const data = await getHeaderData();
  return <HeaderClient data={data} />;
}
