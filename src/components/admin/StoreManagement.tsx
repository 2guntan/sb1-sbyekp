import React, { useState } from 'react';
import { Tabs, TabList, Tab, TabPanel } from './Tabs';
import { MenuItems } from './MenuItems';
import { ExtrasManagement } from '../../modules/extras/components/ExtrasManagement';

export function StoreManagement() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dibi-fg">Store Management</h1>
        <p className="mt-2 text-gray-600">Manage your menu items and extras</p>
      </div>

      <Tabs selectedIndex={activeTab} onChange={setActiveTab}>
        <TabList>
          <Tab>Menu Items</Tab>
          <Tab>Extras</Tab>
        </TabList>

        <TabPanel>
          <MenuItems />
        </TabPanel>

        <TabPanel>
          <ExtrasManagement />
        </TabPanel>
      </Tabs>
    </div>
  );
}