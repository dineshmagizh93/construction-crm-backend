-- Approve all existing users (users created before approval system)
-- New registrations will have isApproved: false by default
UPDATE `users` SET `isApproved` = true WHERE `isApproved` = false OR `isApproved` IS NULL;
