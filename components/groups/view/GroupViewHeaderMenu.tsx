import { router } from "expo-router";
import {
  Button,
  OverflowMenu,
  MenuItem,
  Icon,
  IconProps,
} from "@ui-kitten/components";
import { useState } from "react";

const EditIcon = (props: IconProps) => <Icon {...props} name="edit-outline" />;

const MembersIcon = (props: IconProps) => (
  <Icon {...props} name="people-outline" />
);

export default function GroupViewHeaderMenu({ id }: { id: string }) {
  const [visible, setVisible] = useState(false);

  const onMenuSelect = (index: number) => {
    setVisible(false);
    if (index === 0) {
      router.push({
        pathname: "/(app)/(groups)/edit",
        params: { id },
      });
    } else if (index === 1) {
      router.push({
        pathname: "/(app)/(groups)/(members)",
        params: { id },
      });
    }
  };

  return (
    <OverflowMenu
      anchor={() => (
        <Button
          appearance="ghost"
          accessoryLeft={<Icon name="more-vertical-outline" />}
          onPress={() => setVisible(true)}
        />
      )}
      visible={visible}
      onBackdropPress={() => setVisible(false)}
      onSelect={({ row }) => onMenuSelect(row)}
    >
      <MenuItem title="Edit Group" accessoryLeft={EditIcon} />
      <MenuItem title="Members" accessoryLeft={MembersIcon} />
    </OverflowMenu>
  );
}
