import { RouteConfig, RouteHandler } from '@hono/zod-openapi';
import { AppBindings } from '@/app/internal/shared/types/types';
import { sendWhatsappMessageToUser } from '@/app/internal/services/twilio/create-message/service';
import type { CreateRoute, StatusRoute } from './send-message.routes';
import { MessageStatusBodyRequestSchema } from './schema';
import { HTTPException } from 'hono/http-exception';
import { TwilioErrors } from '@/app/internal/services/twilio/errors/twilio-error';

type AppRouteHandler<R extends RouteConfig> = RouteHandler<R, AppBindings>;

export const createTwillioWpMessageHandler: AppRouteHandler<
    CreateRoute
> = async (c) => {
    const store = c.var.store;
    const twilioClient = c.var.twilioClient;
    const messagesPayload = c.req.valid('json');

    try {
        const responsePayload = await sendWhatsappMessageToUser(
            store,
            twilioClient,
            messagesPayload,
        );

        return c.json(
            {
                success: true,
                messages: responsePayload,
            },
            200,
        );
    } catch (error) {
        c.var.logger.error(error);
        if (error instanceof TwilioErrors) {
            throw new HTTPException(500, {
                message: 'Internal Server Error: Twilio Error ',
            });
        }

        throw new HTTPException(500, { message: 'Internal Server Error' });
    }
};

export const twillioWpMessageStatusHandler: AppRouteHandler<
    StatusRoute
> = async (c) => {
    //c.var.logger.debug({full_payload: c.req.b })

    const body = await c.req.parseBody();

    c.var.logger.debug({ full_payload: body });

    const data = MessageStatusBodyRequestSchema.parse(body);

    await new Promise((r) => setTimeout(r, 20000));

    const updated = await c.var.store.messages.updateMessageStatusBySid(
        data.MessageSid,
        data.MessageStatus,
    );

    //if there is an error uopdating the message it should respond 200 anyways to avoid problems with the callback function of twilio
    if (!updated) {
        c.var.logger.error(
            { sid: data.MessageSid, status: data.MessageStatus },
            'twilio status callback for unknown MessageSid',
        ); // in to update the status of the message in the DB
    }
    c.var.logger.debug({ parsed_body: data });

    //c.var.logger.debug("Twilio response to create message: %s ", response.payload.status);
    return c.json(
        {
            success: true,
            message_status: data.MessageStatus,
            body: 'Callback message from twilio',
            sid: data.MessageSid,
        },
        200,
    );
};
